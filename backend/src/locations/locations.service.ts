import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

// Farg'ona vodiysi viloyatlari — Kamchik dovoni orqali yo'naltirish uchun
const FERGANA_VALLEY = ["Farg'ona viloyati", 'Andijon viloyati', 'Namangan viloyati'];
// Kamchik dovoni waypoint (M39 trassa)
const KAMCHIK_PASS = { lat: 41.02, lng: 70.10 };

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ==========================================
  // SEARCH
  // ==========================================
  async search(query: string) {
    const normalized = this.normalize(query);
    return this.prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { keywords: { contains: normalized, mode: 'insensitive' } },
        ],
      },
      take: 15,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findAll(region?: string) {
    return this.prisma.location.findMany({
      where: region ? { region: { contains: region, mode: 'insensitive' } } : undefined,
      orderBy: [{ region: 'asc' }, { type: 'asc' }, { name: 'asc' }],
    });
  }

  async create(data: { name: string; region: string; type?: string; lat?: number; lng?: number }) {
    const keywords = this.autoGenerateKeywords(data.name);
    return this.prisma.location.create({
      data: {
        name: data.name,
        region: data.region,
        type: data.type || 'CITY',
        lat: data.lat,
        lng: data.lng,
        keywords,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.location.delete({ where: { id } });
  }

  // ==========================================
  // FUZZY MATCHING — bot dan xato kiritilganda
  // ==========================================
  async matchLocation(input: string): Promise<{ name: string; region: string } | null> {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const normalized = this.normalize(trimmed);

    // 1. Exact name match
    const exact = await this.prisma.location.findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
      select: { name: true, region: true },
    });
    if (exact) return exact;

    // 2. Keywords match — kalit so'zlar ichidan qidirish
    const keywordMatch = await this.prisma.location.findMany({
      where: {
        keywords: { contains: normalized, mode: 'insensitive' },
      },
      select: { name: true, region: true, keywords: true },
      take: 10,
    });

    if (keywordMatch.length > 0) {
      // Eng aniq matchni topish — keyword ichida to'liq so'z borligini tekshirish
      for (const loc of keywordMatch) {
        const kws = (loc.keywords || '').toLowerCase().split(',').map(k => k.trim());
        if (kws.includes(normalized)) return { name: loc.name, region: loc.region };
      }
      // Partial match — eng qisqa nomli
      return { name: keywordMatch[0].name, region: keywordMatch[0].region };
    }

    // 3. Name starts with
    const startsWith = await this.prisma.location.findFirst({
      where: { name: { startsWith: trimmed, mode: 'insensitive' } },
      select: { name: true, region: true },
    });
    if (startsWith) return startsWith;

    // 4. Name contains
    const contains = await this.prisma.location.findMany({
      where: { name: { contains: trimmed, mode: 'insensitive' } },
      select: { name: true, region: true },
      take: 5,
    });
    if (contains.length > 0) {
      return contains.sort((a, b) => a.name.length - b.name.length)[0];
    }

    // 5. Normalized prefix match (3+ harf)
    if (normalized.length >= 3) {
      const prefix = normalized.substring(0, 3);
      const partial = await this.prisma.location.findMany({
        where: {
          OR: [
            { name: { startsWith: prefix, mode: 'insensitive' } },
            { keywords: { contains: prefix, mode: 'insensitive' } },
          ],
        },
        select: { name: true, region: true },
        take: 10,
      });
      if (partial.length > 0) {
        const best = partial.sort((a, b) =>
          this.levenshtein(this.normalize(a.name), normalized) -
          this.levenshtein(this.normalize(b.name), normalized),
        )[0];
        // Levenshtein <= 4: xatoli yozuvlarni topish (Toshkend, Samarqant, Buxara)
        const lev = this.levenshtein(this.normalize(best.name), normalized);
        if (lev <= Math.max(2, Math.floor(normalized.length * 0.4))) {
          return best;
        }
      }
    }

    return null;
  }

  // ==========================================
  // OSRM — aniq yo'l masofasi (O'zbekiston ichida)
  // ==========================================
  async calculateDistance(fromName: string, toName: string): Promise<{
    distance: number | null;
    from?: string;
    to?: string;
    fromRegion?: string;
    toRegion?: string;
    message?: string;
  }> {
    const cacheKey = `dist:${fromName.toLowerCase()}:${toName.toLowerCase()}`;
    const cached = await this.redis.get<{ distance: number; from: string; to: string; fromRegion: string; toRegion: string }>(cacheKey);
    if (cached) return cached;

    const [fromLoc, toLoc] = await Promise.all([
      this.prisma.location.findFirst({
        where: { name: { equals: fromName, mode: 'insensitive' } },
      }),
      this.prisma.location.findFirst({
        where: { name: { equals: toName, mode: 'insensitive' } },
      }),
    ]);

    if (!fromLoc?.lat || !fromLoc?.lng || !toLoc?.lat || !toLoc?.lng) {
      return { distance: null, message: 'Lokatsiya koordinatalari topilmadi' };
    }

    try {
      // Farg'ona vodiysi tekshirish — Kamchik dovoni orqali yo'naltirish
      const fromInFergana = FERGANA_VALLEY.includes(fromLoc.region);
      const toInFergana = FERGANA_VALLEY.includes(toLoc.region);

      let url: string;
      if (fromInFergana !== toInFergana) {
        // Bir tomon vodiyda, bir tomon tashqarida — Kamchik orqali
        url = `https://router.project-osrm.org/route/v1/driving/${fromLoc.lng},${fromLoc.lat};${KAMCHIK_PASS.lng},${KAMCHIK_PASS.lat};${toLoc.lng},${toLoc.lat}?overview=false`;
      } else {
        url = `https://router.project-osrm.org/route/v1/driving/${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}?overview=false`;
      }

      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await response.json();

      if (data.code === 'Ok' && data.routes?.[0]) {
        const distanceKm = Math.round(data.routes[0].distance / 1000);
        const result = {
          distance: distanceKm,
          from: fromLoc.name,
          to: toLoc.name,
          fromRegion: fromLoc.region,
          toRegion: toLoc.region,
        };
        await this.redis.set(cacheKey, result, 86400);
        return result;
      }
    } catch (err) {
      this.logger.warn(`OSRM xatolik: ${err}`);
    }

    return { distance: null, message: 'Masofani hisoblashda xatolik' };
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[''`ʻʼ]/g, '')
      .replace(/[_\-\s]+/g, '')
      .replace(/ў/g, 'o')
      .replace(/қ/g, 'q')
      .replace(/ғ/g, 'g')
      .replace(/ҳ/g, 'h')
      .replace(/ш/g, 'sh')
      .replace(/ч/g, 'ch')
      .trim();
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  private autoGenerateKeywords(name: string): string {
    const kws = new Set<string>();
    const lower = name.toLowerCase();
    const noApostrophe = lower.replace(/[''`ʻʼ]/g, '');
    const noSpace = lower.replace(/\s+/g, '');
    const clean = noApostrophe.replace(/\s+/g, '');

    // 1. Asl nom variantlari
    kws.add(lower);
    kws.add(noApostrophe);
    kws.add(noSpace);
    kws.add(clean);

    // 2. Prefikslar (3,4,5,6 harf)
    for (let i = 3; i <= Math.min(6, clean.length); i++) {
      kws.add(clean.substring(0, i));
      kws.add(noApostrophe.substring(0, i));
    }

    // 3. O'zbek → Rus fonetik almashtirishlar
    const cyrillicMap: [RegExp, string][] = [
      [/sh/g, 'ш'], [/ch/g, 'ч'], [/yo/g, 'ё'], [/ya/g, 'я'],
      [/yu/g, 'ю'], [/ye/g, 'е'], [/ts/g, 'ц'], [/ng/g, 'нг'],
    ];
    const charMap: Record<string, string> = {
      a:'а',b:'б',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'ж',
      k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',q:'к',r:'р',s:'с',
      t:'т',u:'у',v:'в',x:'х',y:'й',z:'з',
    };
    let cyrillic = clean;
    for (const [rx, rep] of cyrillicMap) cyrillic = cyrillic.replace(rx, rep);
    cyrillic = cyrillic.split('').map(c => charMap[c] || c).join('');
    if (cyrillic !== clean) kws.add(cyrillic);

    // 4. Fonetik almashtirish variantlari (o'zbek xatolar)
    const swaps: [string, string][] = [
      ["o'", 'o'], ["o'", 'u'], ["o'", 'ў'],
      ["g'", 'g'], ["g'", 'ғ'], ["g'", 'gh'],
      ['q', 'k'], ['q', 'қ'],
      ['x', 'h'], ['x', 'kh'], ['x', 'х'],
      ['sh', 's'], ['sh', 'ш'],
      ['ch', 'c'], ['ch', 'ч'],
      ['j', 'dj'], ['j', 'zh'], ['j', 'ж'],
      ['yo', 'yu'], ['yo', 'ё'],
      ['e', 'э'], ['i', 'iy'],
      ['t', 'd'], ['d', 't'], // oxirgi harf xatolari
      ['k', 'g'], ['g', 'k'],
      ['n', 'm'], // oxirgi harf xatolari
      ['b', 'p'], ['p', 'b'],
    ];
    for (const [from, to] of swaps) {
      if (clean.includes(from)) {
        kws.add(clean.replace(from, to));
        kws.add(clean.replace(new RegExp(from, 'g'), to));
      }
    }

    // 5. Oxirgi harfni o'zgartirish xatolari
    if (clean.length >= 4) {
      const base = clean.slice(0, -1);
      for (const end of ['', 'a', 'o', 'i', 'e', 'n', 'd', 't', 'k', 'q']) {
        kws.add(base + end);
      }
    }

    // 6. Harf tashlab ketish (har bir pozitsiyadan 1 harf)
    if (clean.length >= 5) {
      for (let i = 1; i < clean.length - 1; i++) {
        kws.add(clean.slice(0, i) + clean.slice(i + 1));
      }
    }

    // 7. Qo'shni harflar almashishi (typo)
    if (clean.length >= 4) {
      for (let i = 0; i < clean.length - 1; i++) {
        const arr = clean.split('');
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        kws.add(arr.join(''));
      }
    }

    // 8. Harf ikkilanishi
    if (clean.length >= 4) {
      for (let i = 0; i < clean.length; i++) {
        kws.add(clean.slice(0, i + 1) + clean[i] + clean.slice(i + 1));
      }
    }

    // 9. "tumani" qo'shimchasi bilan/siz
    if (clean.endsWith('tumani')) {
      kws.add(clean.replace('tumani', '').trim());
      kws.add(clean.replace('tumani', 'tuman'));
      kws.add(clean.replace('tumani', 't'));
    } else {
      kws.add(clean + 'tumani');
      kws.add(clean + 'tuman');
    }

    // 10. "shahar" qo'shimchasi
    if (!clean.includes('tumani') && !clean.includes('viloyat')) {
      kws.add(clean + 'shahar');
      kws.add(clean + 'sh');
      kws.add(clean + 'shahari');
    }

    // 11. International variantlar (umumiy)
    const intlSwaps: [string, string][] = [
      ['q', 'k'], ['x', 'kh'], ["g'", 'gh'], ["o'", 'u'],
      ['sh', 'sh'], ['j', 'dzh'], ['tosh', 'tash'], ['sam', 'sam'],
    ];
    let intl = noApostrophe;
    for (const [f, t] of intlSwaps) {
      if (intl.includes(f)) intl = intl.replace(f, t);
    }
    if (intl !== noApostrophe) kws.add(intl);

    // 12. Unli harfsiz (qisqa yozish)
    const noVowels = clean.replace(/[aeiou]/g, '');
    if (noVowels.length >= 2) kws.add(noVowels);

    // 13. Birinchi + oxirgi qism (qisqartma)
    if (clean.length >= 6) {
      kws.add(clean.substring(0, 3) + clean.substring(clean.length - 2));
    }

    // 14. Unli harf almashtirishlar (a↔o, i↔e, u↔o)
    const vowelSwaps: [string, string][] = [
      ['a', 'o'], ['o', 'a'], ['i', 'e'], ['e', 'i'],
      ['u', 'o'], ['o', 'u'], ['a', 'e'], ['e', 'a'],
      ['i', 'y'], ['y', 'i'],
    ];
    for (const [vf, vt] of vowelSwaps) {
      if (clean.includes(vf)) {
        // Birinchi topilgan joyda
        kws.add(clean.replace(vf, vt));
        // Barcha joylarda
        kws.add(clean.replace(new RegExp(vf, 'g'), vt));
      }
    }

    // 15. Ikki harf qo'shish/olib tashlash (dublikat undosh)
    const consonants = 'bcdfghjklmnpqrstvxyz';
    for (let i = 0; i < clean.length; i++) {
      if (consonants.includes(clean[i])) {
        // Dublikat
        kws.add(clean.slice(0, i + 1) + clean[i] + clean.slice(i + 1));
        // Agar dublikat bor — olib tashlash
        if (i < clean.length - 1 && clean[i] === clean[i + 1]) {
          kws.add(clean.slice(0, i) + clean.slice(i + 1));
        }
      }
    }

    // 16. Qo'shimcha fonetik variantlar
    const extraSwaps: [string, string][] = [
      ['yo', 'o'], ['yo', 'ya'],
      ['iy', 'i'], ['iy', 'y'],
      ['ov', 'av'], ['av', 'ov'],
      ['on', 'an'], ['an', 'on'],
      ['or', 'ar'], ['ar', 'or'],
      ['ir', 'er'], ['er', 'ir'],
      ['in', 'en'], ['en', 'in'],
      ['ob', 'ab'], ['ab', 'ob'],
      ['ot', 'at'], ['at', 'ot'],
      ['ok', 'ak'], ['ak', 'ok'],
      ['oz', 'az'], ['az', 'oz'],
      ['iz', 'ez'], ['ez', 'iz'],
      ['ik', 'ek'], ['ek', 'ik'],
    ];
    for (const [ef, et] of extraSwaps) {
      if (clean.includes(ef)) {
        kws.add(clean.replace(ef, et));
      }
    }

    // 17. 2-harf prefikslar + suffiks
    if (clean.length >= 3) {
      for (let end = clean.length; end >= clean.length - 2 && end >= 3; end--) {
        kws.add(clean.substring(0, end));
      }
    }

    // 18. Noto'g'ri klaviatura (eng keng tarqalgan)
    const kbSwaps: [string, string][] = [
      ['s', 'ы'], ['d', 'в'], ['f', 'а'], ['g', 'п'],
      ['h', 'р'], ['j', 'о'], ['k', 'л'], ['l', 'д'],
    ];
    let kbVersion = clean;
    for (const [lf, lt] of kbSwaps) {
      if (kbVersion.includes(lf)) kbVersion = kbVersion.replace(new RegExp(lf, 'g'), lt);
    }
    if (kbVersion !== clean && kbVersion.length >= 2) kws.add(kbVersion);

    // 19. Qisqa nomlar uchun maxsus variantlar
    if (clean.length <= 5) {
      // Barcha undosh almashtirish
      for (const [cf, ct] of [['b','p'],['p','b'],['d','t'],['t','d'],['g','k'],['k','g'],['z','s'],['s','z'],['v','w'],['w','v'],['j','zh'],['zh','j']]) {
        if (clean.includes(cf)) kws.add(clean.replace(cf, ct));
      }
      // Harf qo'shish (har pozitsiyaga)
      for (const c of 'aeioubdgklmnrstv') {
        kws.add(clean + c);
        kws.add(c + clean);
        if (clean.length >= 3) kws.add(clean.slice(0, 2) + c + clean.slice(2));
      }
      // Katta-kichik harf variantlari
      kws.add(clean.toUpperCase());
      kws.add(clean[0].toUpperCase() + clean.slice(1));
      // Takroriy harf
      for (let i = 0; i < clean.length; i++) {
        kws.add(clean.slice(0, i) + clean[i] + clean[i] + clean.slice(i + 1));
      }
      // Qo'shimchalar
      for (const suf of ['tumani','tuman','shahar','sh','shahr','sha','i','ni','da','ga','dan']) {
        kws.add(clean + suf);
        kws.add(clean + ' ' + suf);
      }
    }

    // 20. Barcha nomlar uchun qo'shimcha suffiks variantlar
    for (const suf of ['i','ni','da','ga','dan','ning','lar','dagi']) {
      kws.add(clean + suf);
    }

    // 21. Oldingi/keyingi harf xatolari (keyboard proximity)
    const adjacent: Record<string, string[]> = {
      q:['w','a'],w:['q','e','s'],e:['w','r','d'],r:['e','t','f'],t:['r','y','g'],
      y:['t','u','h'],u:['y','i','j'],i:['u','o','k'],o:['i','p','l'],p:['o','l'],
      a:['q','s','z'],s:['a','d','w','x'],d:['s','f','e','c'],f:['d','g','r','v'],
      g:['f','h','t','b'],h:['g','j','y','n'],j:['h','k','u','m'],k:['j','l','i'],
      l:['k','o','p'],z:['a','x','s'],x:['z','c','s','d'],c:['x','v','d','f'],
      v:['c','b','f','g'],b:['v','n','g','h'],n:['b','m','h','j'],m:['n','j','k'],
    };
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      if (adjacent[ch]) {
        for (const adj of adjacent[ch]) {
          kws.add(clean.slice(0, i) + adj + clean.slice(i + 1));
        }
      }
    }

    return [...kws].filter(k => k.length >= 2).join(',');
  }

  // ==========================================
  // SEED — 14 viloyat + barcha tuman/shaharlar + kalit so'zlar
  // ==========================================
  async seed() {
    await this.prisma.location.deleteMany();
    const locations = this.getSeedData();
    await this.prisma.location.createMany({ data: locations });
    this.logger.log(`${locations.length} ta lokatsiya qo'shildi`);
    // Cache tozalash
    await this.redis.delPattern('dist:*');
    return { message: `${locations.length} ta lokatsiya muvaffaqiyatli qo'shildi` };
  }

  private getSeedData() {
    type Row = { name: string; region: string; type: string; lat: number; lng: number; keywords: string };
    const data: Row[] = [];

    // ==========================================
    // KALIT SO'ZLAR XARITASI (50+ varianti)
    // ==========================================
    const KEYWORDS: Record<string, string> = {
      // ======= TOSHKENT SHAHRI =======
      'Toshkent': 'toshkent,toshkend,tashkent,tashkend,ташкент,тошкент,ташкен,тошкен,tosh,toshken,toshknt,tashknt,tosken,toskend,toshk,tashk,тош,таш,tashken,ташкент,toshkent shahri,toshkentshahri',
      'Bektemir': 'bektemir,bektimir,bektemer,bektamir,bektemir tumani,bektemr,bktemir,bektemir tuman,бектемир',
      'Chilonzor': 'chilonzor,chilanzor,chilanzar,chilonzar,chillonzor,chilanzr,chil,chilonzr,чиланзор,чилонзор,chilonzor tumani',
      'Yakkasaroy': 'yakkasaroy,yakkasaray,yakasaroy,yakkasaroi,яккасарой,яккасарай,yakasaray,ykksaroy,yakkasaro',
      'Mirobod': 'mirobod,mirabod,mirabad,mirоbоd,мирабад,миробод,mirobad,mirobid,mirоbad,mirobоd',
      "Mirzo Ulug'bek": "mirzo ulugbek,mirzo ulug'bek,ulugbek,ulughbek,ulugbk,mirzo,mirzoulugbek,мирзо улугбек,улугбек,mirzoulughbek,mirzo ulg,m.ulugbek",
      'Sergeli': 'sergeli,sergili,sirgali,sirgeli,серегли,сергели,sergali,srgeli,srgali',
      'Shayxontohur': "shayxontohur,shayxontoxur,shayxantoxur,shayxontahur,shayxontahur,шайхонтохур,шайхантахур,shayxon,shayx,shayxontoh,shayxontour,shayxontoxr",
      'Olmazor': 'olmazor,almazor,olmazar,almazar,olmazr,алмазор,олмазор,almazar tumani,olmazor tuman',
      'Uchtepa': 'uchtepa,uchteppa,uchtipa,учтепа,учтеппа,uchtepe,uchtpa,uchtep',
      'Yashnobod': 'yashnobod,yashnabad,yashnabot,yashnobot,яшнабад,яшнободd,yashnobad,yashnobd,yashnbd',
      'Yunusobod': 'yunusobod,yunusabad,yunusabot,yunusobot,юнусабад,юнусобод,yunusabd,yunusobd,yunsabad,yunsobod,yunusоbоd',

      // ======= TOSHKENT VILOYATI =======
      'Nurafshon': 'nurafshon,nurafshan,nurafson,нурафшон,нурафшан,nurafshon shahar,nurfshon,nurafsh,nurafshоn',
      'Olmaliq': "olmaliq,almaliq,olmalik,almalik,олмалик,олмалиқ,almalyk,olmalyk,olmaliq shahar,olmalq,almalq,almalk",
      'Angren': 'angren,angiren,angrin,ongren,ангрен,angran,angrn,angre,ongren,angiren',
      'Chirchiq': 'chirchiq,chirchik,chirchik shahar,чирчик,чирчиқ,chirchq,chrchiq,chirchk,chrchik',
      'Bekobod': 'bekobod,bekabad,bekabod,bekabot,бекабад,бекобод,bekabad shahar,bekоbоd,bekobоd,bekbd,bekabоd',
      'Ohangaron': 'ohangaron,ahangaron,oxangaron,ohongoron,оханагарон,ohangaran,оhangaron,ohngaron,ahngaron',
      "Yangiyo'l": "yangiyl,yangiyol,yangiyul,yangiyo'l,yangyol,янгиюл,янгийўл,yngiyol,yangiyol shahar,yangiyl shahar,yangiyol sh",
      "Bo'ka": "boka,buka,bo'ka,бука,бўка,buka tumani",
      "Bo'stonliq": "bostonliq,bustonliq,bo'stonliq,bostanliq,bustanliq,бўстонлик,бостанлик,bostonlq,bstonliq",
      'Chinoz': 'chinoz,chinaz,chinoztumani,чиноз,чиназ,chinoz tumani,chnoz',
      'Qibray': 'qibray,kibray,qibrai,кибрай,қибрай,qibrai tumani,qibry',
      'Parkent': 'parkent,parkend,паркент,parknt,prkent,parkend tumani',
      'Piskent': 'piskent,piskend,пискент,pisknt,pskent,piskend tumani',
      'Zangiota': 'zangiota,zangiata,зангиата,зангиота,zangota,zangiota tumani,zangiоta',

      // ======= SAMARQAND =======
      'Samarqand': "samarqand,samarkand,samarkant,samarqant,самарканд,самарқанд,samar,samark,smrqnd,samarqnd,samarknd,samarkan,sam,samarqand shahar,samarqand sh",
      "Kattaqo'rg'on": "kattaqorgon,kattakurgan,kattakurgon,kattaqurgan,kattaqorgon,каттақўрғон,каттакурган,kattaqorgon shahar,kattaqrgon,kattaqurgon,kattakurgan shahar,kttqorgon",
      "Bulung'ur": "bulungur,bulungor,bulung'ur,булунғур,булунгур,bulngur,blungur",
      'Ishtixon': 'ishtixon,ishtihon,ishtikhan,иштихон,иштихан,ishtxon,ishtihоn',
      'Jomboy': 'jomboy,jambay,jombay,jomboi,жомбой,жомбай,jomby,jmbay',
      'Urgut': 'urgut,urgud,urgat,ургут,ургуд,urgut tumani,urguttumani,urgtt',

      // ======= BUXORO =======
      'Buxoro': "buxoro,bukhara,buhara,buhoro,бухоро,бухара,bux,buxara,bukhoro,buxоrо,buхоrо,buhara shahar,buxoro shahar,bukhara shahar",
      'Kogon': 'kogon,kagan,kagon,каган,когон,kogon shahar,kgon,kagn',
      "G'ijduvon": "gijduvon,g'ijduvon,gijduvan,gijdivon,гиждувон,гиждуван,gijdvon,gjduvon,gijduvоn,gijduvon shahar",
      'Romitan': 'romitan,romitоn,ромитан,romtian,romitn,romtan',
      'Shofirkon': 'shofirkon,shafirkan,shofirkan,шофиркан,шофиркон,shafirkon,shfrkon,shofirkn',
      'Vobkent': 'vobkent,vabkent,vоbkent,вобкент,вабкент,vobknt,vbkent',
      "Qorako'l": "qorakol,korakol,qorakul,korakul,қоракўл,коракуль,qorakol tumani,qrkol",
      'Olot': 'olot,alat,alot,олот,алат,olot tumani',

      // ======= FARG'ONA =======
      "Farg'ona": "fargona,fergana,farghona,fargana,фергана,фарғона,fer,ferg,fergona,fargоna,frgona,fargna,fargona shahar,fergana shahar",
      "Marg'ilon": "margilon,marginlon,margelon,margilan,маргилан,маргилон,margilon shahar,mrgilon,margilоn,margiln",
      'Quvasoy': "quvasoy,kuvasoy,quvasay,kuvasay,кувасай,қувасой,quvasoy shahar,quvsoy,kuvsoy,qvsoy",
      "Qo'qon": "qoqon,kokand,kokon,quqon,koqon,коканд,қўқон,kokond,qqon,qoqon shahar,kokand shahar,qoqn,qqn,koknd",
      'Rishton': 'rishton,rishtan,rishtоn,риштон,риштан,rshton,rishtn,rishton tumani',
      "So'x": "sox,soh,sux,so'x,сох,сўх,sox tumani",
      'Quva': 'quva,kuva,қува,кува,quva tumani,qva,kva',
      'Oltiariq': 'oltiariq,altiariq,oltyariq,oltiоriq,олтиарик,oltariq,oltiarq',
      'Beshariq': 'beshariq,beshоriq,бешарик,бешарик,beshriq,besharq',

      // ======= ANDIJON =======
      'Andijon': "andijon,andijan,andizhan,andizan,андижан,андижон,and,andjn,andijоn,andijоn shahar,andijan shahar,andijon shahar",
      'Asaka': 'asaka,assaka,osoka,asoka,асака,asaka shahar,asak,аsака',
      'Xonobod': 'xonobod,xonabad,khonabad,xonobоd,хонабад,хонобод,xnobod,xonbd,xonоbоd,xonabad shahar',
      'Shahrixon': 'shahrixon,shaxrixon,shahrixan,shahrikhan,шахрихон,шахрихан,shahrixn,shxrixon,shahrixоn',
      'Marhamat': 'marhamat,marxamat,marhamt,мархамат,marhmat,mrhamat',

      // ======= NAMANGAN =======
      'Namangan': "namangan,наманган,namangon,namngan,nam,namangn,namоngan,namangan shahar",
      'Chust': "chust,chust tumani,чуст,chst,chust shahar",
      'Pop': 'pop,pap,поп,пап,pop tumani',
      'Kosonsoy': 'kosonsoy,kasansay,kosоnsоy,косонсой,касансай,kosnsoy,ksonsoy',
      "Uchqo'rg'on": "uchqorgon,uchkurgan,uchqurgan,учқўрғон,учкурган,uchqrgon,uchkurgon,uchqurgn",

      // ======= NAVOIY =======
      'Navoiy': 'navoiy,navoi,navoyi,навоий,навои,naviy,nvoiy,navoiy shahar,navoi shahar',
      'Zarafshon': 'zarafshon,zarafshan,зарафшон,зарафшан,zarafshоn,zarfshon,zrfshon,zarafshon shahar',
      'Uchquduq': 'uchquduq,uchkuduk,учқудуқ,учкудук,uchquduq shahar,uchqudq',
      'Nurota': 'nurota,nurata,нурата,нурота,nurоta,nrota',

      // ======= QASHQADARYO =======
      'Qarshi': 'qarshi,karshi,karsi,қарши,карши,qrshi,qarsh,karsh,qarshi shahar,karshi shahar',
      'Shahrisabz': "shahrisabz,shakhrisabz,shahrisabs,шахрисабз,shahrisabz shahar,shakhrisabs,shahrsabz,shrisabz,shahrisbs,shakhrisabz shahar",
      'Kitob': 'kitob,kitab,китаб,китоб,kitоb,ktob,kitob shahar',
      "G'uzor": "guzor,g'uzor,ghuzor,гузор,ғузор,guzar,ghuzor tumani,gzor",
      'Muborak': 'muborak,mubarek,мубарак,муборак,mubarak,mborak,mubоrak',
      'Koson': 'koson,kasan,касан,косон,kosоn,kson',

      // ======= SURXONDARYO =======
      'Termiz': 'termiz,termez,tirmiz,tirmez,термез,термиз,termiz shahar,termez shahar,trmiz,trmez,termz',
      'Denov': 'denov,denau,denоv,денау,денов,denv,dnov,denov tumani,denau tumani',
      'Boysun': 'boysun,baysun,бойсун,байсун,boysn,bysun',
      'Sherobod': 'sherobod,sherabad,sherоbоd,шерабад,шеробод,sherоbad,sherabd,shrobod',

      // ======= JIZZAX =======
      'Jizzax': 'jizzax,jizzakh,djizak,jizax,жиззах,джизак,jizzah,jzzax,jizzax shahar,jizzakh shahar,jizak',
      'Zomin': 'zomin,zamin,зомин,замин,zоmin,zmn,zomin tumani',
      'Paxtakor': 'paxtakor,pahtakor,пахтакор,пахтакўр,paxtakr,pxtakor',

      // ======= SIRDARYO =======
      'Guliston': 'guliston,gulistan,гулистон,гулистан,gulstan,gulistоn,gulstn,guliston shahar,gulistan shahar',
      'Yangiyer': 'yangiyer,yangier,янгиер,янгиер,yangiyr,yngiyer,yangiyer shahar',
      'Shirin': 'shirin,shirin shahar,ширин,shrn,shirn',
      'Boyovut': 'boyovut,bayavut,boyaut,бойовут,баявут,boyоvut,byvut,boyovt',

      // ======= XORAZM =======
      'Urganch': 'urganch,urgench,ургенч,урганч,urgnch,urgench shahar,urganch shahar,urgench sh',
      'Xiva': 'xiva,khiva,хива,хива shahar,xva,khva,xiva shahar,khiva shahar',
      'Gurlan': 'gurlan,гурлан,gurln,grlan,gurlan tumani',
      'Hazorasp': 'hazorasp,hazarasp,хазарасп,хазорасп,hzorasp,hazrasp',
      "Tuproqqal'a": "tuproqqala,tuprokkala,tuproqala,тупроққала,тупроккала,tuproqala tumani,tuprqqala",

      // ======= QORAQALPOG'ISTON =======
      'Nukus': 'nukus,нукус,nuks,nukus shahar,nkus,nukuss',
      "Mo'ynoq": "moynoq,moynaq,muinak,muynoq,мўйноқ,муйнак,moynoq shahar,mynоq,moynq",
      'Kungrad': 'kungrad,kungirot,қунғирот,кунград,kungrad tumani,kngrat,kungrоt',
      "To'rtko'l": "tortkol,turtkul,to'rtko'l,тўрткўл,турткул,tortkul,tortkоl",
      "Xo'jayli": "xojayli,hojayli,xojaili,хўжайли,ходжейли,xojaily,hojayli tumani,xjyli",
      'Chimboy': 'chimboy,chimbay,чимбай,чимбой,chimby,chmbay',
      'Beruniy': 'beruniy,beruniy tumani,берунийй,beruny,brniy',

      // ======= VILOYATLAR =======
      'Toshkent shahri': 'toshkent shahri,ташкент,тошкент,tashkent city,toshkent shahar,toshkent sh',
      'Toshkent viloyati': 'toshkent viloyati,toshkent v,tashkent region,тошкент вилояти',
      'Samarqand viloyati': 'samarqand viloyati,samarqand v,самарканд,samarkand region',
      'Buxoro viloyati': 'buxoro viloyati,buxoro v,бухоро,bukhara region',
      "Farg'ona viloyati": "fargona viloyati,fargona v,фаргона,fergana region,fargona vil",
      'Andijon viloyati': 'andijon viloyati,andijon v,андижон,andijan region',
      'Namangan viloyati': 'namangan viloyati,namangan v,наманган вилояти',
      'Navoiy viloyati': 'navoiy viloyati,navoiy v,навоий вилояти',
      'Qashqadaryo viloyati': "qashqadaryo viloyati,qashqadaryo v,kashkadarya,кашкадарья,қашқадарё,kashkadaryo",
      'Surxondaryo viloyati': 'surxondaryo viloyati,surxondaryo v,surkhandarya,сурхондарё,сурхандарья,surhandaryo',
      'Jizzax viloyati': 'jizzax viloyati,jizzax v,jizzakh,джизак вилояти',
      'Sirdaryo viloyati': 'sirdaryo viloyati,sirdaryo v,сырдарья,sirdarya',
      'Xorazm viloyati': 'xorazm viloyati,xorazm v,khorezm,хоразм,хорезм',
      "Qoraqalpog'iston Respublikasi": "qoraqalpogiston,karakalpakstan,каракалпакстан,қорақалпоғистон,qoraqalpogiston respublikasi,qqr",
    };

    const regions: Record<string, {
      lat: number; lng: number;
      cities: [string, number, number][];
      districts: [string, number, number][];
    }> = {
      'Toshkent shahri': {
        lat: 41.2995, lng: 69.2401,
        cities: [['Toshkent', 41.2995, 69.2401]],
        districts: [
          ['Bektemir', 41.2167, 69.3333], ['Chilonzor', 41.2736, 69.1858],
          ['Yakkasaroy', 41.2881, 69.2761], ['Mirobod', 41.3150, 69.2769],
          ["Mirzo Ulug'bek", 41.3400, 69.3300], ['Sergeli', 41.2283, 69.2739],
          ['Shayxontohur', 41.3225, 69.2228], ['Olmazor', 41.3333, 69.1833],
          ['Uchtepa', 41.2833, 69.1667], ['Yashnobod', 41.3419, 69.3028],
          ['Yunusobod', 41.3650, 69.2875],
        ],
      },
      'Toshkent viloyati': {
        lat: 41.3167, lng: 69.5000,
        cities: [
          ['Nurafshon', 41.0389, 69.3275], ['Olmaliq', 40.8453, 69.5983],
          ['Angren', 41.0167, 70.1439], ['Chirchiq', 41.4689, 69.5822],
          ['Bekobod', 40.2208, 69.2706], ['Ohangaron', 41.0667, 69.6333],
          ["Yangiyo'l", 41.1117, 69.0500],
        ],
        districts: [
          ['Bekobod tumani', 40.2300, 69.2800], ["Bo'ka", 40.9500, 69.2167],
          ["Bo'stonliq", 41.6000, 70.2167], ['Chinoz', 40.9333, 68.7667],
          ['Qibray', 41.3667, 69.4833], ['Ohangaron tumani', 41.0500, 69.6500],
          ["Oqqo'rg'on", 40.9333, 69.6833], ['Parkent', 41.2950, 69.6767],
          ['Piskent', 40.8833, 69.3500], ['Quyi Chirchiq', 41.0667, 69.0833],
          ["O'rta Chirchiq", 41.2167, 69.5000], ["Yangiyo'l tumani", 41.1100, 69.0600],
          ['Yuqori Chirchiq', 41.5333, 69.7500], ['Zangiota', 41.1833, 69.1833],
          ['Toshkent tumani', 41.3333, 69.3833],
        ],
      },
      'Samarqand viloyati': {
        lat: 39.6542, lng: 66.9597,
        cities: [['Samarqand', 39.6542, 66.9597], ["Kattaqo'rg'on", 39.8989, 66.2561]],
        districts: [
          ["Bulung'ur", 39.7667, 67.2667], ['Ishtixon', 39.9667, 66.5167],
          ['Jomboy', 39.7167, 67.1833], ["Kattaqo'rg'on tumani", 39.9000, 66.2500],
          ['Narpay', 39.9167, 66.5500], ['Nurobod', 39.5667, 67.2833],
          ['Oqdaryo', 39.6167, 67.0167], ["Past darg'om", 39.5833, 66.9167],
          ['Payariq', 39.7833, 67.0833], ['Paxtachi', 39.4833, 66.5833],
          ['Samarqand tumani', 39.6400, 66.9400], ['Toyloq', 39.4667, 67.2833],
          ['Urgut', 39.4000, 67.2500],
        ],
      },
      'Buxoro viloyati': {
        lat: 39.7747, lng: 64.4286,
        cities: [['Buxoro', 39.7747, 64.4286], ['Kogon', 39.7225, 64.5464], ["G'ijduvon", 40.1000, 64.6833]],
        districts: [
          ['Buxoro tumani', 39.7800, 64.4300], ["G'ijduvon tumani", 40.1000, 64.6800],
          ['Jondor', 39.9833, 64.1667], ['Kogon tumani', 39.7200, 64.5500],
          ['Olot', 39.7500, 63.5833], ['Peshku', 39.3833, 64.7167],
          ["Qorako'l", 39.5000, 63.8500], ['Qorovulbozor', 39.5167, 64.7000],
          ['Romitan', 39.9333, 64.3833], ['Shofirkon', 40.1333, 64.5000],
          ['Vobkent', 40.0167, 64.5167],
        ],
      },
      "Farg'ona viloyati": {
        lat: 40.3734, lng: 71.7893,
        cities: [
          ["Farg'ona", 40.3734, 71.7893], ["Marg'ilon", 40.4703, 71.7140],
          ['Quvasoy', 40.5342, 71.9800], ["Qo'qon", 40.5286, 70.9425],
        ],
        districts: [
          ["Bag'dod", 40.3833, 71.2333], ['Beshariq', 40.4167, 70.5833],
          ['Buvayda', 40.4167, 71.0167], ["Dang'ara", 40.5667, 70.9333],
          ["Farg'ona tumani", 40.3700, 71.7800], ['Furqat', 40.2833, 71.4167],
          ['Oltiariq', 40.5167, 71.4333], ["O'zbekiston", 40.3500, 71.6167],
          ['Quva', 40.5167, 71.9500], ['Rishton', 40.3500, 71.2667],
          ["So'x", 39.9667, 71.1333], ['Toshloq', 40.5333, 71.7667],
          ["Uchko'prik", 40.5500, 71.0333], ['Yozyovon', 40.2000, 71.6333],
        ],
      },
      'Andijon viloyati': {
        lat: 40.7821, lng: 72.3442,
        cities: [['Andijon', 40.7821, 72.3442], ['Asaka', 40.6400, 72.2400], ['Xonobod', 40.8000, 72.0000]],
        districts: [
          ['Andijon tumani', 40.7800, 72.3400], ['Asaka tumani', 40.6400, 72.2400],
          ['Baliqchi', 40.9333, 72.2667], ["Bo'z", 40.6833, 72.1667],
          ['Buloqboshi', 40.6333, 72.4333], ['Izboskan', 40.9000, 72.1667],
          ['Jalolquduq', 40.7500, 72.5500], ['Marhamat', 40.5000, 72.3167],
          ["Oltinko'l", 40.8333, 72.3000], ['Paxtaobod', 40.7500, 72.1333],
          ["Qo'rg'ontepa", 40.7333, 72.0833], ['Shahrixon', 40.7167, 72.0500],
          ["Ulug'nor", 40.7833, 72.2667], ["Xo'jaobod", 40.6500, 72.5833],
        ],
      },
      'Namangan viloyati': {
        lat: 40.9983, lng: 71.6726,
        cities: [['Namangan', 40.9983, 71.6726], ['Chust', 41.0000, 71.2333]],
        districts: [
          ['Chortoq', 41.0667, 71.9833], ['Chust tumani', 41.0000, 71.2300],
          ['Kosonsoy', 41.2500, 71.5500], ['Mingbuloq', 40.7833, 71.1500],
          ['Namangan tumani', 41.0000, 71.6700], ['Norin', 41.0833, 71.3333],
          ['Pop', 41.0833, 70.8167], ["To'raqo'rg'on", 40.9833, 71.5167],
          ["Uchqo'rg'on", 41.1167, 71.0333], ['Uychi', 41.0833, 71.8000],
          ["Yangiqo'rg'on", 41.2000, 71.7167],
        ],
      },
      'Navoiy viloyati': {
        lat: 40.1033, lng: 65.3793,
        cities: [['Navoiy', 40.1033, 65.3793], ['Zarafshon', 41.5756, 64.1853], ['Uchquduq', 42.1567, 63.5550]],
        districts: [
          ['Karmana', 40.1333, 65.3667], ['Konimex', 40.2833, 65.0000],
          ['Navbahor', 40.4500, 65.1333], ['Navoiy tumani', 40.1000, 65.3800],
          ['Nurota', 40.5667, 65.6833], ['Qiziltepa', 39.8833, 65.4000],
          ['Tomdi', 42.0000, 64.9000], ['Xatirchi', 40.2333, 65.9333],
        ],
      },
      'Qashqadaryo viloyati': {
        lat: 38.8606, lng: 65.7986,
        cities: [['Qarshi', 38.8606, 65.7986], ['Shahrisabz', 39.0517, 66.8303], ['Kitob', 39.1325, 66.8567]],
        districts: [
          ['Chiroqchi', 38.8833, 66.5833], ['Dehqonobod', 38.3500, 66.4833],
          ["G'uzor", 38.6167, 66.2333], ['Kasbi', 38.9333, 65.4500],
          ['Kitob tumani', 39.1300, 66.8600], ['Koson', 38.7667, 65.5167],
          ['Mirishkor', 38.8500, 65.1667], ['Muborak', 39.1833, 65.2500],
          ['Nishon', 38.5333, 65.5333], ['Qarshi tumani', 38.8600, 65.8000],
          ['Shahrisabz tumani', 39.0500, 66.8300], ["Yakkabog'", 38.9500, 66.6833],
        ],
      },
      'Surxondaryo viloyati': {
        lat: 37.2241, lng: 67.2783,
        cities: [['Termiz', 37.2241, 67.2783], ['Denov', 38.2667, 67.8833]],
        districts: [
          ['Angor', 38.4833, 67.5333], ['Bandixon', 38.3000, 68.0000],
          ['Boysun', 38.2000, 67.2000], ['Denov tumani', 38.2700, 67.8800],
          ["Jarqo'rg'on", 37.5167, 67.4167], ['Muzrabot', 37.4333, 67.9500],
          ['Oltinsoy', 38.0333, 67.5333], ['Qiziriq', 37.8833, 67.5833],
          ["Qumqo'rg'on", 37.7833, 67.7833], ['Sariosiyo', 38.4000, 67.9833],
          ['Sherobod', 37.6500, 67.0000], ["Sho'rchi", 37.9833, 67.7833],
          ['Termiz tumani', 37.2200, 67.2800], ['Uzun', 38.1000, 67.9000],
        ],
      },
      'Jizzax viloyati': {
        lat: 40.1158, lng: 67.8422,
        cities: [['Jizzax', 40.1158, 67.8422]],
        districts: [
          ['Arnasoy', 40.5833, 68.0333], ['Baxmal', 39.9667, 68.2500],
          ["Do'stlik", 40.5333, 67.9500], ['Forish', 40.3667, 68.5500],
          ["G'allaorol", 40.0833, 67.6000], ['Jizzax tumani', 40.1200, 67.8400],
          ["Mirzacho'l", 40.5667, 68.2667], ['Paxtakor', 40.2833, 67.4833],
          ['Sharof Rashidov', 40.2667, 68.4500], ['Yangiobod', 39.8500, 68.0333],
          ['Zafarobod', 40.5500, 68.3167], ['Zomin', 39.9500, 68.4000],
        ],
      },
      'Sirdaryo viloyati': {
        lat: 40.4897, lng: 68.7842,
        cities: [
          ['Guliston', 40.4897, 68.7842], ['Yangiyer', 40.3300, 68.8400],
          ['Shirin', 40.2300, 68.8500], ['Boyovut', 40.1200, 68.3000],
        ],
        districts: [
          ['Boyovut tumani', 40.1200, 68.3000], ['Guliston tumani', 40.4900, 68.7800],
          ['Mirzaobod', 40.4000, 68.5333], ['Oqoltin', 40.4000, 68.9000],
          ['Sardoba', 40.3833, 68.6667], ['Sayxunobod', 40.2167, 68.8000],
          ['Sirdaryo tumani', 40.4667, 68.6667], ['Xovos', 40.5833, 68.8833],
        ],
      },
      'Xorazm viloyati': {
        lat: 41.5500, lng: 60.6333,
        cities: [['Urganch', 41.5500, 60.6333], ['Xiva', 41.3775, 60.3619]],
        districts: [
          ["Bog'ot", 41.6167, 60.7833], ['Gurlan', 41.7333, 60.6167],
          ['Hazorasp', 41.3167, 60.9333], ["Qo'shko'pir", 41.2500, 60.3167],
          ['Shovot', 41.6667, 60.5000], ['Urganch tumani', 41.5500, 60.6300],
          ['Xiva tumani', 41.3800, 60.3600], ['Xonqa', 41.5000, 60.8167],
          ['Yangiariq', 41.4000, 60.5500], ['Yangibozor', 41.7333, 60.7500],
          ["Tuproqqal'a", 41.5833, 60.2500],
        ],
      },
      "Qoraqalpog'iston Respublikasi": {
        lat: 42.4628, lng: 59.6036,
        cities: [['Nukus', 42.4628, 59.6036], ["Mo'ynoq", 43.7633, 58.6894]],
        districts: [
          ['Amudaryo', 41.9667, 60.0333], ['Beruniy', 41.6833, 60.7500],
          ['Chimboy', 42.9333, 59.7833], ["Ellikqal'a", 41.7500, 60.7167],
          ['Kegeyli', 42.7833, 58.6833], ['Kungrad', 43.0000, 58.7000],
          ["Mo'ynoq tumani", 43.7600, 58.6900], ['Nukus tumani', 42.4600, 59.6000],
          ["Qanliko'l", 42.0500, 59.5000], ["Qo'ng'irot", 42.9833, 58.6667],
          ["Qorao'zak", 42.6333, 59.6167], ['Shumanay', 42.4500, 59.3833],
          ["Taxtako'pir", 42.5000, 58.1500], ["To'rtko'l", 41.5500, 60.8000],
          ["Xo'jayli", 42.4000, 59.4500],
        ],
      },
    };

    for (const [regionName, { lat: rLat, lng: rLng, cities, districts }] of Object.entries(regions)) {
      const autoRegKw = this.autoGenerateKeywords(regionName);
      const manualRegKw = KEYWORDS[regionName] || '';
      const regionKw = manualRegKw ? `${manualRegKw},${autoRegKw}` : autoRegKw;
      data.push({ name: regionName, region: regionName, type: 'REGION', lat: rLat, lng: rLng, keywords: regionKw });

      for (const [name, lat, lng] of cities) {
        const autoKw = this.autoGenerateKeywords(name);
        const manualKw = KEYWORDS[name] || '';
        const kw = manualKw ? `${manualKw},${autoKw}` : autoKw;
        data.push({ name, region: regionName, type: 'CITY', lat, lng, keywords: kw });
      }

      for (const [name, lat, lng] of districts) {
        const autoKw = this.autoGenerateKeywords(name);
        const manualKw = KEYWORDS[name] || '';
        const kw = manualKw ? `${manualKw},${autoKw}` : autoKw;
        data.push({ name, region: regionName, type: 'DISTRICT', lat, lng, keywords: kw });
      }
    }

    return data;
  }
}

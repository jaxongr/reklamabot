import { useState, useEffect } from 'react'
import { getBalance, getTransactions } from '../api'

export default function BalancePage() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBalance().catch(() => ({ balance: 0 })),
      getTransactions().catch(() => []),
    ])
      .then(([bal, txs]) => {
        setBalance(bal?.balance || 0)
        setTransactions(Array.isArray(txs) ? txs : txs?.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    )
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount)
  }

  return (
    <div className="page">
      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-label">Joriy balans</div>
        <div className="balance-amount">{formatAmount(balance)} so'm</div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Tranzaksiyalar</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty" style={{ padding: '20px 0' }}>
            <div className="empty-text">Tranzaksiyalar yo'q</div>
          </div>
        ) : (
          <ul className="tx-list">
            {transactions.slice(0, 20).map((tx: any) => (
              <li key={tx.id} className="tx-item">
                <div className="tx-info">
                  <div className="tx-desc">{tx.description || tx.type}</div>
                  <div className="tx-date">
                    {new Date(tx.createdAt).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                <div className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatAmount(tx.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

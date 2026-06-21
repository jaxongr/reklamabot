import { createContext, useContext, useState, type ReactNode } from 'react'

export type BusinessModule = 'LOGISTIKA' | 'TAKSI'

interface ModuleContextType {
  module: BusinessModule
  setModule: (m: BusinessModule) => void
  isLogistika: boolean
  isTaksi: boolean
}

const ModuleContext = createContext<ModuleContextType>({
  module: 'LOGISTIKA',
  setModule: () => {},
  isLogistika: true,
  isTaksi: false,
})

export const useModule = () => useContext(ModuleContext)

export const ModuleProvider = ({ children }: { children: ReactNode }) => {
  const [module, setModuleState] = useState<BusinessModule>(() => {
    return (localStorage.getItem('businessModule') as BusinessModule) || 'LOGISTIKA'
  })

  const setModule = (m: BusinessModule) => {
    setModuleState(m)
    localStorage.setItem('businessModule', m)
  }

  return (
    <ModuleContext.Provider value={{
      module,
      setModule,
      isLogistika: module === 'LOGISTIKA',
      isTaksi: module === 'TAKSI',
    }}>
      {children}
    </ModuleContext.Provider>
  )
}

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  const transactions = useMemo(
    () => {
      return paginatedTransactions?.data ?? transactionsByEmployee ?? null
    },
    [paginatedTransactions, transactionsByEmployee]
  )

  const clearTransactionsCachedResults = () => {
    paginatedTransactionsUtils.clearCachedResults()
    transactionsByEmployeeUtils.clearCachedResults()
  }

  const loadAllTransactions = useCallback(async () => {
    setIsLoadingEmployees(true)
    setIsLoadingTransactions(true)
    transactionsByEmployeeUtils.invalidateData()

    let employeePromise = employeeUtils.fetchAll()
    let transactionPromise = paginatedTransactionsUtils.fetchAll()

    await employeePromise
    setIsLoadingEmployees(false)

    await transactionPromise
    setIsLoadingTransactions(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsLoadingTransactions(true)
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setIsLoadingTransactions(false)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoadingEmployees={isLoadingEmployees}
          isLoadingTransactions={isLoadingTransactions}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null || newValue.id === '') {
              await loadAllTransactions()
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} clearTransactionsCachedResults={clearTransactionsCachedResults} />

          {transactions !== null && paginatedTransactions !== null && paginatedTransactions.nextPage !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}

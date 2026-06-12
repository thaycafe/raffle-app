import { Fragment, Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoTrashBinSharp, IoChevronDown, IoChevronForward } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import LanguageToggle from '../components/shared/LanguageToggle'
import { clearAuth } from '../service/auth'
import { useAdminTickets } from '../hooks/useAdminTickets'
import ConfirmationModal from '../components/modal/ConfirmationModal'
import RaffleModal from '../components/modal/RaffleModal'
import type { DeleteTarget, DeleteModalData } from '../types/admin'
import type { Prize } from '../types/home'
import { getDrawnPositions, removeDrawnPrize } from '../utils/raffleStorage'

const RaffleOverlay = lazy(() => import('../components/raffle/RaffleOverlay'))

function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [raffleModalOpen, setRaffleModalOpen] = useState(false)
  const [raffleOverlayOpen, setRaffleOverlayOpen] = useState(false)
  const [rafflePrize, setRafflePrize] = useState<Prize | undefined>(undefined)
  const [drawnPrizeIndexes, setDrawnPrizeIndexes] = useState<number[]>([])
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null)

  useEffect(() => {
    const drawnPositions = getDrawnPositions()
    console.log('Loaded drawn positions from storage:', drawnPositions)
    setDrawnPrizeIndexes(drawnPositions)
  }, [])

  const {
    tickets,
    groups,
    inUse,
    busyGroup,
    expanded,
    togglePaid,
    removeTicket,
    markGroupPaid,
    removeGroupTickets,
    toggleExpand,
  } = useAdminTickets()

  const logout = () => {
    clearAuth()
    navigate('/')
  }

  const openRaffleModal = () => {
    setRaffleOverlayOpen(false)
    setRaffleModalOpen(true)
  }

  const closeDeleteModal = () => setDeleteTarget(null)

  const deleteModalData = useMemo<DeleteModalData>(() => {
    if (!deleteTarget) {
      return { title: '', message: '', isLoading: false, variant: 'danger' }
    }

    if (deleteTarget.type === 'single') {
      return {
        title: t('admin.deleteModal.titleSingle'),
        message: t('admin.deleteModal.messageSingle', {
          numbers: `#${deleteTarget.ticket.number}`,
          name: deleteTarget.ticket.name,
        }),
        isLoading: inUse === deleteTarget.ticket.number,
        variant: 'danger',
      }
    }

    if (deleteTarget.type === 'delete-group') {
      return {
        title: t('admin.deleteModal.titleGroup'),
        message: t('admin.deleteModal.messageGroup', {
          numbers: deleteTarget.group.tickets.map((tk) => `#${tk.number}`).join(', '),
          name: deleteTarget.group.name,
        }),
        isLoading: busyGroup === deleteTarget.group.key,
        variant: 'danger',
      }
    }

    // mark-paid
    const unpaidCount = deleteTarget.group.tickets.filter((tk) => !tk.paid).length
    return {
      title: t('admin.markPaidModal.title'),
      message: t('admin.markPaidModal.message', {
        count: unpaidCount,
        name: deleteTarget.group.name,
      }),
      isLoading: busyGroup === deleteTarget.group.key,
      variant: 'primary',
    }
  }, [busyGroup, deleteTarget, inUse, t])

  const confirmAction = async () => {
    if (!deleteTarget) return

    let success: boolean
    if (deleteTarget.type === 'single') {
      success = (await removeTicket(deleteTarget.ticket.number)) ?? false
    } else if (deleteTarget.type === 'delete-group') {
      success = (await removeGroupTickets(deleteTarget.group)) ?? false
    } else {
      success = (await markGroupPaid(deleteTarget.group)) ?? false
    }

    if (success) closeDeleteModal()
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-(--bg-surface)/10">
      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 10 }}>
        <div className="flex justify-end mb-2">
          <Link
            to="/"
            className="text-md font-medium text-(--gold-light) hover:text-(--gold-whisper) self-center transition mr-3"
          >
            {t('footer.raffle')}
          </Link>
          <LanguageToggle />
          <button
            onClick={logout}
            className="text-sm font-medium text-(--gold-mid) px-3 py-1 transition cursor-pointer ml-1"
          >
            {t('admin.signOut')}
          </button>
        </div>

        <header className="p-6 mb-6 flex justify-center items-center">
          <div>
            <h1 className="text-2xl font-bold text-(--gold-light)">{t('admin.dashboardTitle')}</h1>
            <p className="text-(--gold-light) text-sm mt-1">
              {groups.length} {t('admin.people')} · {tickets.length} {t('admin.reservations')}
            </p>
          </div>
        </header>

        <div className="mb-6 flex justify-center">
          <button
            type="button"
            onClick={openRaffleModal}
            className="rounded-xl border border-(--gold-mid) bg-(--bg-base)/70 px-4 py-2 font-semibold transition hover:border-(--gold-light)"
          >
            <span className="title-shimmer">{t('admin.startRaffle')}</span>
          </button>
        </div>

        <section className="bg-(--bg-surface) rounded-2xl shadow-sm p-6 border border-(--gold-dark)">
          {groups.length === 0 ? (
            <p className="text-(--gold-dark) text-center py-6">{t('admin.empty')}</p>
          ) : (
            <>
              {/* ── Mobile card view ─────────────────────────── */}
              <div className="md:hidden space-y-4">
                {groups.map((group) => {
                  const isOpen = expanded.has(group.key)
                  const isGroupBusy = busyGroup === group.key
                  const allPaid = group.paidCount === group.totalCount
                  return (
                    <div
                      key={group.key}
                      className="rounded-xl border border-(--gold-dark) bg-(--bg-base)/30 overflow-hidden"
                    >
                      {/* Group header row */}
                      <div
                        className="flex items-start gap-2 p-3 cursor-pointer hover:bg-(--bg-base)/40 transition"
                        onClick={() => toggleExpand(group.key)}
                      >
                        <span className="text-(--gold-mid) shrink-0">
                          {isOpen ? <IoChevronDown size={15} /> : <IoChevronForward size={15} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-(--gold-light) leading-tight truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-(--gold-mid) truncate mt-0.5">{group.phone}</p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                            allPaid
                              ? 'bg-(--gold-mid) text-(--bg-base)'
                              : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark)'
                          }`}
                        >
                          {group.paidCount}/{group.totalCount}
                        </span>
                      </div>

                      {/* Group meta + actions */}
                      <div className="px-3 pb-3 border-t border-(--gold-dark)/20 pt-2 space-y-3">
                        <div className="space-y-1 text-xs">
                          <p className="text-(--gold-mid)/70 uppercase tracking-wider">
                            {t('admin.numbers')}
                          </p>
                          <p className="font-mono text-(--gold-mid) wrap-break-word">
                            {group.tickets.map((tk) => `#${tk.number}`).join(', ')}
                          </p>
                          <p className="text-(--gold-mid)/70 uppercase tracking-wider pt-1">
                            {t('admin.reservedAt')}
                          </p>
                          <p className="text-(--gold-light)">
                            {group.lastReservedAt
                              ? new Date(group.lastReservedAt).toLocaleString()
                              : '—'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeleteTarget({ type: 'mark-paid', group })}
                            disabled={allPaid || isGroupBusy}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium border transition ${
                              allPaid
                                ? 'opacity-30 cursor-not-allowed border-(--gold-dark) text-(--gold-dark)'
                                : 'border-(--gold-mid) text-(--gold-mid) hover:bg-(--gold-mid) hover:text-(--bg-base) cursor-pointer'
                            } ${isGroupBusy ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {t('admin.markAllPaid')}
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'delete-group', group })}
                            className={`shrink-0 rounded border border-(--error) p-2 text-(--error) transition hover:bg-(--error)/10 ${isGroupBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                            aria-label={t('admin.removeTicket')}
                          >
                            <IoTrashBinSharp size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded ticket sub-cards */}
                      {isOpen && (
                        <div className="border-t border-(--gold-dark)/30 space-y-2 p-2">
                          {group.tickets.map((ticket) => {
                            const isBusy = inUse === ticket.number
                            return (
                              <div
                                key={ticket.number}
                                className="rounded-lg border border-(--gold-dark)/30 bg-(--bg-base)/15 p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-(--gold-mid) font-bold text-sm">
                                    #{ticket.number}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      ticket.paid
                                        ? 'bg-(--gold-mid) text-(--bg-base)'
                                        : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark)'
                                    }`}
                                  >
                                    {ticket.paid ? t('admin.paidYes') : t('admin.paidNo')}
                                  </span>
                                </div>

                                <div className="text-xs">
                                  <p className="text-(--gold-mid)/70 uppercase tracking-wider">
                                    {t('admin.reservedAt')}
                                  </p>
                                  <p className="text-(--gold-light)">
                                    {ticket.reserved_at
                                      ? new Date(ticket.reserved_at).toLocaleString()
                                      : '—'}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => togglePaid(ticket)}
                                    disabled={isBusy}
                                    className={`px-2 py-1 rounded text-xs font-bold transition ${
                                      ticket.paid
                                        ? 'bg-(--gold-mid) text-(--bg-base) hover:bg-(--gold-light)'
                                        : 'bg-(--bg-base) text-(--gold-mid) border border-(--gold-dark) hover:border-(--gold-mid)'
                                    } ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                  >
                                    {ticket.paid ? t('admin.markAsPending') : t('admin.markAsPaid')}
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ type: 'single', ticket })}
                                    className={`rounded border border-(--error) text-(--error) text-xs font-semibold transition hover:bg-(--error)/10 ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                  >
                                    {t('admin.removeTicket')}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── Desktop table view ───────────────────────── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-center border-b border-(--gold-dark)/30 text-(--gold-light) uppercase tracking-wider text-xs">
                      <th className="py-3 pr-2 w-8"></th>
                      <th className="pr-4">{t('admin.name')}</th>
                      <th className="pr-4">{t('admin.phone')}</th>
                      <th className="pr-4">{t('admin.numbers')}</th>
                      <th className="pr-4">{t('admin.status')}</th>
                      <th className="pr-4">{t('admin.reservedAt')}</th>
                      <th className="pr-4">{t('admin.registerPayment')}</th>
                      <th className="text-center">{t('admin.removeTicket')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => {
                      const isOpen = expanded.has(group.key)
                      const isGroupBusy = busyGroup === group.key
                      const allPaid = group.paidCount === group.totalCount
                      return (
                        <Fragment key={group.key}>
                          <tr
                            className="text-center border-b border-(--gold-dark)/20 hover:bg-(--bg-base)/40 transition cursor-pointer"
                            onClick={() => toggleExpand(group.key)}
                          >
                            <td className="py-3 pr-2 text-(--gold-mid)">
                              {isOpen ? (
                                <IoChevronDown size={16} className="inline" />
                              ) : (
                                <IoChevronForward size={16} className="inline" />
                              )}
                            </td>
                            <td className="pr-4 text-(--gold-light) font-semibold">{group.name}</td>
                            <td className="pr-4 text-(--gold-mid)">{group.phone}</td>
                            <td className="pr-4 font-mono text-(--gold-mid) text-xs">
                              {group.tickets.map((tk) => tk.number).join(', ')}
                            </td>
                            <td className="pr-4">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  allPaid
                                    ? 'bg-(--gold-mid) text-(--bg-base)'
                                    : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark)'
                                }`}
                              >
                                {group.paidCount}/{group.totalCount} {t('admin.paidYes')}
                              </span>
                            </td>
                            <td className="pr-4 text-xs text-(--gold-mid)">
                              {group.lastReservedAt
                                ? new Date(group.lastReservedAt).toLocaleString()
                                : '—'}
                            </td>
                            <td className="pr-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setDeleteTarget({ type: 'mark-paid', group })}
                                disabled={allPaid || isGroupBusy}
                                className={`px-2 py-1 rounded text-xs font-medium border transition ${
                                  allPaid
                                    ? 'opacity-30 cursor-not-allowed border-(--gold-dark) text-(--gold-dark)'
                                    : 'border-(--gold-mid) text-(--gold-mid) hover:bg-(--gold-mid) hover:text-(--bg-base) cursor-pointer'
                                } ${isGroupBusy ? 'opacity-50 cursor-wait' : ''}`}
                              >
                                {t('admin.markAllPaid')}
                              </button>
                            </td>
                            <td className="text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center">
                                <IoTrashBinSharp
                                  size={18}
                                  onClick={() => setDeleteTarget({ type: 'delete-group', group })}
                                  className={`text-(--error) hover:opacity-70 transition ${isGroupBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                />
                              </div>
                            </td>
                          </tr>

                          {isOpen &&
                            group.tickets.map((ticket) => {
                              const isBusy = inUse === ticket.number
                              return (
                                <tr
                                  key={`${group.key}-${ticket.number}`}
                                  className="text-center border-b border-(--gold-dark)/10 bg-(--bg-base)/20"
                                >
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td className="py-2 pr-4 font-mono text-(--gold-mid) font-bold">
                                    #{ticket.number}
                                  </td>
                                  <td className="pr-4">
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        ticket.paid
                                          ? 'bg-(--gold-mid) text-(--bg-base)'
                                          : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark)'
                                      }`}
                                    >
                                      {ticket.paid ? t('admin.paidYes') : t('admin.paidNo')}
                                    </span>
                                  </td>
                                  <td className="pr-4 text-xs text-(--gold-mid)">
                                    {ticket.reserved_at
                                      ? new Date(ticket.reserved_at).toLocaleString()
                                      : '—'}
                                  </td>
                                  <td className="pr-4">
                                    <button
                                      onClick={() => togglePaid(ticket)}
                                      disabled={isBusy}
                                      className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                                        ticket.paid
                                          ? 'bg-(--gold-mid) text-(--bg-base) hover:bg-(--gold-light)'
                                          : 'bg-(--bg-base) text-(--gold-mid) border border-(--gold-dark) hover:border-(--gold-mid) hover:text-(--gold-mid)'
                                      } ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                    >
                                      {ticket.paid
                                        ? t('admin.markAsPending')
                                        : t('admin.markAsPaid')}
                                    </button>
                                  </td>
                                  <td>
                                    <div className="flex justify-center">
                                      <IoTrashBinSharp
                                        size={18}
                                        onClick={() => setDeleteTarget({ type: 'single', ticket })}
                                        className={`text-(--error) hover:opacity-70 transition ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
      <ConfirmationModal
        open={deleteTarget !== null}
        title={deleteModalData.title}
        message={deleteModalData.message}
        confirmText={
          deleteTarget?.type === 'mark-paid'
            ? t('admin.markPaidModal.confirm')
            : t('admin.deleteModal.confirm')
        }
        cancelText={t('admin.deleteModal.cancel')}
        isLoading={deleteModalData.isLoading}
        variant={deleteModalData.variant}
        onClose={closeDeleteModal}
        onConfirm={() => {
          void confirmAction()
        }}
      />
      {raffleModalOpen && (
        <RaffleModal
          open={raffleModalOpen}
          onClose={() => setRaffleModalOpen(false)}
          drawnIndexes={drawnPrizeIndexes}
          defaultSelectedIndex={selectedPrizeIndex}
          onResetPrize={(position) => {
            setDrawnPrizeIndexes((prev) => prev.filter((idx) => idx !== position))
            removeDrawnPrize(position)
          }}
          onDraw={(prize, position) => {
            setSelectedPrizeIndex(position)
            setDrawnPrizeIndexes((prev) => (prev.includes(position) ? prev : [...prev, position]))
            setRaffleModalOpen(false)
            setRafflePrize(prize)
            setRaffleOverlayOpen(true)
          }}
        />
      )}
      {raffleOverlayOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-70 grid place-items-center bg-black/70 text-(--gold-light)">
              Loading 3D Raffle...
            </div>
          }
        >
          <RaffleOverlay
            open={raffleOverlayOpen}
            prize={rafflePrize}
            prizeNumber={selectedPrizeIndex}
            onBackToPrizeSelection={() => {
              setRaffleOverlayOpen(false)
              const updatedPositions = getDrawnPositions()
              setDrawnPrizeIndexes(updatedPositions)
              setRafflePrize(undefined)
              setRaffleModalOpen(true)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AdminDashboard

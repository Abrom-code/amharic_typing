export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-slide-in">
        {children}
      </div>
    </div>
  )
}

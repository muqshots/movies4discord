interface ParentProps {
    children: React.ReactNode;
}

const Modal = ({ children }: ParentProps) => {
    return (
        <div className="modal fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        
        <div className="modal-container bg-theme w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
    
          <div className="modal-content py-4 text-center px-6">
            {children}
          </div>
        </div>
      </div>
    )
}

export default Modal;
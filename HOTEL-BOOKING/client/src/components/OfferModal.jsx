import React from 'react'

const OfferModal = ({ offer, onClose }) => {
  if (!offer) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{offer.title}</h3>
            <p className="text-sm text-gray-500">Ends: {offer.expiryDate}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-black">×</button>
        </div>

        <img src={offer.image} alt={offer.title} className="w-full h-56 object-cover rounded mt-4" />

        <p className="text-gray-700 mt-4">{offer.description}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-lg font-semibold">{offer.priceOff}% OFF</div>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default OfferModal

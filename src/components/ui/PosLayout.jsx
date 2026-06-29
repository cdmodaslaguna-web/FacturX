export default function PosLayout({ catalogPane, cartPane }) {
  return (
    <div className="pos-layout">
      <div className="pos-catalog">
        {catalogPane}
      </div>
      <div className="pos-cart">
        {cartPane}
      </div>
    </div>
  )
}

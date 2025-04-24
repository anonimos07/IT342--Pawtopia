import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { PawPrint, ShoppingBag, Package } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Button } from "../components/ui/Button"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("id")
    axios
      .get(`http://localhost:8080/api/order/getAllOrdersByUserId`, {
        params: { userId },
      })
      .then((response) => {
        console.log("Orders fetched from backend:", response.data)
        setOrders(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching orders:", error)
        setLoading(false)
      })
  }, [])

  const calculateTotal = (items) => {
    const shippingFee = 30
    let itemsTotal = 0

    if (items) {
      items.forEach((item) => {
        console.log("Item details in calculateTotal:", item)
        if (item.price && item.quantity) {
          itemsTotal += item.price * item.quantity
          console.log("Item price:", item.price)
          console.log("Item quantity:", item.quantity)
        }
      })
    }

    return itemsTotal + shippingFee
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 relative overflow-hidden">
        <ScatteredPaws />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2 text-center">View and track all your orders</p>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                  <Button asChild>
                    <Link to="/products" className="rounded-full">
                      Browse Products
                    </Link>
                  </Button>
                </div>
              ) : (
                orders.map((order) => {
                  console.log("Order data:", order)
                  const total = calculateTotal(order.orderItems || [])

                  return (
                    <div
                      key={order.orderID}
                      className="bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Background Paw Print */}
                      <div className="absolute top-0 right-0 opacity-5 -mt-6 -mr-6">
                        <PawPrint className="h-32 w-32 text-primary" />
                      </div>

                      {/* Order Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">{order.orderDate}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.orderStatus === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.orderStatus === "SHIPPED"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        {order.orderItems && order.orderItems.length > 0 ? (
                          order.orderItems.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-4 ${
                                index !== order.orderItems.length - 1 ? "pb-4 border-b border-gray-200" : ""
                              }`}
                            >
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={item.orderItemImage || "/placeholder.svg"}
                                  alt={item.orderItemName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.orderItemName}</h4>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">₱{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No items available for this order.</p>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Shipping Fee</span>
                          <span className="font-medium">₱30.00</span>
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-primary text-lg">₱{total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 text-right">
                        <Button asChild className="rounded-full">
                          <Link to={`/MyPurchases/${order.orderID}`}>View Order</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Orders

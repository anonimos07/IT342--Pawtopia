import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Button } from "../components/ui/Button"

const CheckoutPage = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const { selectedItems, orderSummary } = location.state || {
    selectedItems: [],
    orderSummary: {},
  }

  const clearState = () => {
    navigate(location.pathname, { state: { selectedItems: [], orderSummary: {} } })
  }

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("googleuser"))
    const userId = user?.id || user?.userId

    if (!userId) {
      navigate("/")
      return
    }
    if (selectedItems.length === 0) {
      navigate("/cart")
      return
    }

    axios
      .get(`http://localhost:8080/users/me`)
      .then((response) => {
        setUser(response.data)
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
      })
  }, [navigate, selectedItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting order, current user state:", user);
    // Get user directly from localStorage again to ensure we have the latest data
    const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("googleuser"))
    const userId = storedUser?.id || storedUser?.userId

    if (selectedItems.length === 0) {
      alert("No items to order. Please go back and add items to the cart.")
      return
    }

    const orderItems = selectedItems.map((item) => ({
      orderItemName: item.product.productName,
      orderItemImage: item.product.productImage || "/placeholder.svg?height=100&width=100",
      price: item.product.productPrice,
      quantity: item.quantity,
      productId: item.product.productID,
    }))

    const orderDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

    const orderData = {
      orderItems,
      orderDate,
      orderStatus: "To Receive",
      paymentMethod: "Cash on Delivery",
      totalPrice: orderSummary.total,
      user: user,
    }

    try {
      const response = await axios.post("http://localhost:8080/api/order/postOrderRecord", orderData)

      if (response.status === 200) {
        alert("Order successfully placed!")

        for (const item of selectedItems) {
          const cartItemId = item.cartItemId
          await axios
            .delete(`http://localhost:8080/api/cartItem/deleteCartItem/${cartItemId}`)
            .then((response) => {
              if (response.status === 200) {
                console.log(`Cart item ${cartItemId} removed from cart`)
              }
            })
            .catch((error) => {
              console.error(`Error removing cart item ${cartItemId}:`, error)
            })
        }

        clearState()

        navigate("/MyPurchases", { state: { orders: response.data } })
      } else {
        alert("Failed to place the order. Please try again.")
      }
    } catch (error) {
      console.error("Error placing the order:", error)
      alert("An error occurred while placing the order.")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-2 text-center">
                Complete your purchase by reviewing your order and confirming your details.
              </p>
            </div>

            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>

            <div className="grid md:grid-cols-7 gap-8">
              {/* Order Summary */}
              <div className="md:col-span-4">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-4">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product.productImage || "/placeholder.svg?height=100&width=100"}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.productName}</h3>
                          <p className="text-sm text-gray-500">
                            ₱{item.product.productPrice} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₱{(item.product.productPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₱{orderSummary.subtotal}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping Fee</span>
                      <span className="font-medium">₱{orderSummary.shippingFee}</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-primary">₱{orderSummary.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Billing & Shipping Details</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-medium">
                        {user.address?.streetBuildingHouseNo} {user.address?.barangay}, {user.address?.city} City,
                        Region {user.address?.region}, {user.address?.postalCode}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                      <p className="font-medium">Cash on Delivery</p>
                    </div>

                    <Button type="submit" className="w-full rounded-full mt-4">
                      Place Order
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CheckoutPage

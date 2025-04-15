"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PawPrint, Edit2, Save, X, Package, Calendar } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    petName: "",
    petType: "",
    petBreed: "",
    petAge: "",
  })

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Initialize form data with user data
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        address: parsedUser.address || "",
        petName: parsedUser.petName || "Buddy",
        petType: parsedUser.petType || "Dog",
        petBreed: parsedUser.petBreed || "Golden Retriever",
        petAge: parsedUser.petAge || "3",
      })
    }
    setLoading(false)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSave = () => {
    // Update user data
    const updatedUser = {
      ...user,
      ...formData,
    }

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setEditMode(false)
  }

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      petName: user.petName || "Buddy",
      petType: user.petType || "Dog",
      petBreed: user.petBreed || "Golden Retriever",
      petAge: user.petAge || "3",
    })
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <PawPrint className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">You are not logged in</h1>
        <p className="text-gray-600 mb-6">Please log in to view your profile</p>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Profile Header */}
              <div className="bg-primary/10 p-8 relative">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-3xl font-bold text-primary">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name || user.username}</h1>
                    <p className="text-gray-600">
                      Member since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="absolute top-4 right-4 p-2 text-gray-700 hover:text-primary bg-white rounded-full shadow-sm"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Profile Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                      {editMode && (
                        <div className="flex gap-2">
                          <button onClick={handleSave} className="p-1 text-green-600 hover:text-green-800">
                            <Save className="h-5 w-5" />
                          </button>
                          <button onClick={handleCancel} className="p-1 text-red-600 hover:text-red-800">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1">{user.name || "Not provided"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="mt-1">{user.email || "Not provided"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                          <p className="mt-1">{user.phone || "Not provided"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Address</h3>
                          <p className="mt-1">{user.address || "Not provided"}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pet Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Pet Information</h2>

                    {editMode ? (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
                            Pet Name
                          </label>
                          <input
                            type="text"
                            id="petName"
                            name="petName"
                            value={formData.petName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>

                        <div>
                          <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">
                            Pet Type
                          </label>
                          <select
                            id="petType"
                            name="petType"
                            value={formData.petType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Fish">Fish</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="petBreed" className="block text-sm font-medium text-gray-700 mb-1">
                            Breed
                          </label>
                          <input
                            type="text"
                            id="petBreed"
                            name="petBreed"
                            value={formData.petBreed}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>

                        <div>
                          <label htmlFor="petAge" className="block text-sm font-medium text-gray-700 mb-1">
                            Age (years)
                          </label>
                          <input
                            type="number"
                            id="petAge"
                            name="petAge"
                            value={formData.petAge}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Pet Name</h3>
                          <p className="mt-1">{user.petName || "Buddy"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Pet Type</h3>
                          <p className="mt-1">{user.petType || "Dog"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                          <p className="mt-1">{user.petBreed || "Golden Retriever"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Age</h3>
                          <p className="mt-1">{user.petAge || "3"} years</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="mt-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>

                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Link
                      to="/products"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="mt-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>

                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                    <p className="text-gray-600 mb-4">You don't have any upcoming appointments.</p>
                    <Link
                      to="/appointment"
                      className="inline-block bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Pawtopia</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">© {new Date().getFullYear()} Pawtopia. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

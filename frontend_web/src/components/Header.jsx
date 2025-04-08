import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Search, ShoppingBag, Menu, PawPrint } from 'lucide-react';

export default function Header({ activePage = 'home' }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl text-primary">Pawtopia</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`font-medium ${activePage === 'home' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`font-medium ${activePage === 'products' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Products
          </Link>
          <Link 
            to="/services" 
            className={`font-medium ${activePage === 'services' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Services
          </Link>
          <Link 
            to="/about" 
            className={`font-medium ${activePage === 'about' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button className="hidden md:flex" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
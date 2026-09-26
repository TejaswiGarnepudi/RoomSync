import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-4">
      <h1 className="text-9xl font-bold text-teal-600">404</h1>
      <h2 className="text-3xl font-semibold text-stone-900 mt-4">Page not found</h2>
      <p className="text-stone-600 mt-2 mb-8 text-center max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link to="/">
        <Button>Go back home</Button>
      </Link>
    </div>
  );
}

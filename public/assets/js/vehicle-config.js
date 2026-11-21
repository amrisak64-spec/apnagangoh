// Shared vehicle options for both the add form and the filter panel.
export const VEHICLE_CONFIG = {
  // Change 1: scooter options live under bike; only car and bike are selectable.
  types: [
    { value: 'car', label: 'कार' },
    { value: 'bike', label: 'बाइक' },
  ],
  brands: {
    car: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'Renault', 'Skoda', 'Volkswagen', 'MG', 'Nissan', 'Ford', 'Chevrolet', 'अन्य'],
    bike: ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Ather', 'Ola Electric', 'अन्य'],
  },
  fuels: {
    car: [['petrol', 'पेट्रोल'], ['diesel', 'डीज़ल'], ['cng', 'CNG'], ['electric', 'इलेक्ट्रिक']],
    bike: [['petrol', 'पेट्रोल'], ['electric', 'इलेक्ट्रिक']],
  },
  kmRanges: [
    { value: '', label: 'कोई सीमा नहीं' },
    { value: '10000', label: '10,000 तक' },
    { value: '25000', label: '25,000 तक' },
    { value: '50000', label: '50,000 तक' },
    { value: '75000', label: '75,000 तक' },
    { value: '100000', label: '1,00,000 तक' },
    { value: '100000+', label: '1,00,000+' },
  ],
  priceRanges: [
    { value: '', label: 'कोई सीमा नहीं' },
    { value: '50000', label: '₹50,000 तक' },
    { value: '100000', label: '₹1 लाख तक' },
    { value: '250000', label: '₹2.5 लाख तक' },
    { value: '500000', label: '₹5 लाख तक' },
    { value: '1000000', label: '₹10 लाख तक' },
  ],
};

export function vehicleYears(currentYear = new Date().getFullYear()) {
  return Array.from({ length: Math.max(0, currentYear - 1989) }, (_, index) => currentYear - index);
}

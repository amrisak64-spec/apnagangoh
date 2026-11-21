// Shared category definitions for homepage shortcuts, filters and listing forms.
// Vehicle subcategories continue to use type="vehicle" in the existing Firestore schema.
export const CATEGORIES = {
  plot: { id: 'plot', type: 'plot', label: 'प्लॉट', icon: 'plot.webp', href: 'browse.html?type=plot', fields: ['title', 'description', 'price', 'ratePerGaj', 'areaSize', 'location', 'contactWhatsApp', 'photos'] },
  house: { id: 'house', type: 'house', label: 'मकान / फ्लैट', icon: 'house.webp', href: 'browse.html?type=house', fields: ['title', 'description', 'price', 'areaSize', 'location', 'contactWhatsApp', 'photos'] },
  shop: { id: 'shop', type: 'shop', label: 'दुकान / ऑफिस', icon: 'shop.webp', href: 'browse.html?type=shop', fields: ['title', 'description', 'price', 'areaSize', 'location', 'contactWhatsApp', 'photos'] },
  agri: { id: 'agri', type: 'agri', label: 'खेती की ज़मीन', icon: 'agri.webp', href: 'browse.html?type=agri', fields: ['title', 'description', 'price', 'ratePerBigha', 'areaSize', 'location', 'contactWhatsApp', 'photos'] },
  // Change 1 and 2: one shared homepage tile and add-listing category for vehicles.
  vehicle: { id: 'vehicle', type: 'vehicle', label: 'कार और बाइक', icon: 'vehicle.svg', href: 'vehicles.html', browseHidden: true, fields: ['brand', 'model', 'year', 'kmDriven', 'fuelType', 'ownerNumber', 'price', 'negotiable', 'insuranceValidTill', 'transmission', 'registrationLast4', 'cc', 'bikeType', 'contactWhatsApp', 'photos'] },
  // Keep subtype records for existing browse labels and URLs, but don't expose them as duplicate tiles or form categories.
  car: { id: 'car', type: 'vehicle', vehicleType: 'car', label: 'कार', icon: 'vehicle.svg', href: 'vehicles.html?vehicleType=car', homepageHidden: true, formHidden: true, fields: ['brand', 'model', 'year', 'kmDriven', 'fuelType', 'ownerNumber', 'price', 'negotiable', 'insuranceValidTill', 'transmission', 'registrationLast4', 'contactWhatsApp', 'photos'] },
  bike: { id: 'bike', type: 'vehicle', vehicleType: 'bike', vehicleTypes: ['bike', 'scooty'], label: 'बाइक / स्कूटी', icon: 'vehicle.svg', href: 'vehicles.html?vehicleType=bike', homepageHidden: true, formHidden: true, fields: ['brand', 'model', 'year', 'kmDriven', 'fuelType', 'ownerNumber', 'price', 'negotiable', 'insuranceValidTill', 'cc', 'bikeType', 'contactWhatsApp', 'photos'] },
  career: { id: 'career', type: 'career', label: 'नौकरी', formLabel: 'करियर & पढ़ाई', icon: 'career.webp', homeIcon: 'jobs.webp', href: 'jobs.html', fields: ['guidanceFor', 'domain', 'mode', 'fee', 'location', 'contactWhatsApp'] },
  directory: { id: 'directory', type: 'directory', label: 'बिज़नेस डायरेक्टरी', icon: 'directory.webp', href: 'directory.html', fields: ['businessName', 'category', 'phone', 'address', 'village'] },
};

export const VEHICLE_CATEGORY_IDS = Object.values(CATEGORIES).filter(category => category.vehicleType).map(category => category.id);
export const LISTING_CATEGORY_IDS = Object.values(CATEGORIES).filter(category => category.type !== 'directory' && !category.formHidden).map(category => category.id);
// Keep the existing browse filter choices unchanged while the add form uses the combined vehicle entry.
export const BROWSE_CATEGORY_IDS = Object.values(CATEGORIES).filter(category => category.type !== 'directory' && !category.browseHidden).map(category => category.id);
export const HOMEPAGE_CATEGORY_IDS = Object.values(CATEGORIES).filter(category => !category.homepageHidden).map(category => category.id);

export function vehicleCategoryFor(listing) {
  return listing?.vehicleType === 'car' ? CATEGORIES.car : CATEGORIES.bike;
}

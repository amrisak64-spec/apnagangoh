// Gangoh Town + ~30 nearest villages (Saharanpur district, UP)
// Used for browse filters, post form, and footer village list

export const TOWN = { value: "gangoh", label: "गंगोह शहर", isTown: true };

export const VILLAGES = [
  { value: "khatoli",      label: "खटोली" },
  { value: "deoband",      label: "देवबंद" },
  { value: "rampur_maniharan", label: "रामपुर मनिहारन" },
  { value: "nakur",        label: "नकुड़" },
  { value: "sarsawa",      label: "सरसावा" },
  { value: "titron",       label: "तितरों" },
  { value: "bhagwanpur",   label: "भगवानपुर" },
  { value: "muzaffarabad", label: "मुज़फ़्फ़राबाद" },
  { value: "thanabhawan",  label: "थानाभवन" },
  { value: "shamli",       label: "शामली" },
  { value: "kairana",      label: "कैराना" },
  { value: "jalalabad",    label: "जलालाबाद" },
  { value: "kandhla",      label: "कांधला" },
  { value: "kundla",       label: "कुण्डला" },
  { value: "lisad",        label: "लिसाढ़" },
  { value: "pilakhni",     label: "पिलखनी" },
  { value: "fatehpur_dor", label: "फतेहपुर दोर" },
  { value: "nanauta",      label: "नानौता" },
  { value: "sasni_ghat",   label: "ससनी घाट" },
  { value: "mirzapur_gangoh", label: "मिर्ज़ापुर (गंगोह)" },
  { value: "baliakheri",   label: "बलियाखेड़ी" },
  { value: "khera_khurd",  label: "खेड़ा खुर्द" },
  { value: "tikri",        label: "टिकरी" },
  { value: "bhopa",        label: "भोपा" },
  { value: "sikarpur",     label: "सिकरपुर" },
  { value: "muzaffarpur_gangoh", label: "मुज़फ़्फ़रपुर (गंगोह)" },
  { value: "rasulpur",     label: "रसूलपुर" },
  { value: "sultanpur_gangoh", label: "सुल्तानपुर (गंगोह)" },
  { value: "majra_gangoh", label: "माजरा (गंगोह)" },
  { value: "other",        label: "अन्य गाँव" },
];

export const ALL_LOCATIONS = [TOWN, ...VILLAGES];

// For filter dropdowns — returns [{value, label}]
export function getVillageOptions() {
  return VILLAGES;
}

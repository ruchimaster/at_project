export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString();
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address || ""
  )}`;
}
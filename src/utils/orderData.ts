const cleanText = (value: any) => (typeof value === 'string' ? value.trim() : '');

const toNumber = (value: any) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const firstText = (...values: any[]) => {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return '';
};

export function getOrderCargo(order: any) {
  const source = order?.cargoDetails || {};
  const legacyCargo = typeof order?.cargo === 'string' ? order.cargo : order?.cargo || {};

  return {
    description: firstText(
      source.description,
      source.cargoName,
      source.name,
      legacyCargo.description,
      legacyCargo.name,
      legacyCargo.cargo,
      order?.cargo
    ),
    weight:
      toNumber(source.weight ?? source.weightKg ?? source.mass) ??
      toNumber(legacyCargo.weight ?? legacyCargo.weightKg ?? order?.weight) ??
      0,
    volume:
      toNumber(source.volume ?? source.volumeM3) ??
      toNumber(legacyCargo.volume ?? legacyCargo.volumeM3 ?? order?.volume) ??
      0,
  };
}

export function getOrderPrice(order: any) {
  return (
    toNumber(order?.pricing?.customerOffer) ??
    toNumber(order?.pricing?.price) ??
    toNumber(order?.price) ??
    toNumber(order?.rate)
  );
}

export function getRoutePoint(order: any, key: 'from' | 'to') {
  const point = order?.route?.[key] || {};
  const legacyValue =
    key === 'from'
      ? firstText(order?.from, order?.otkuda)
      : firstText(order?.to, order?.kuda);

  const address = firstText(
    point.address,
    point.displayName,
    point.name,
    point.label,
    point.city,
    legacyValue
  );

  const city = firstText(point.city, point.town, point.village, address);
  const lat = toNumber(point.coordinates?.lat ?? point.lat ?? point.latitude);
  const lng = toNumber(
    point.coordinates?.lng ??
      point.coordinates?.lon ??
      point.lng ??
      point.lon ??
      point.longitude
  );

  return {
    address,
    city,
    label: city || address || legacyValue,
    coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  };
}

export function getRouteLabel(order: any, key: 'from' | 'to', fallback = 'Не указано') {
  return getRoutePoint(order, key).label || fallback;
}

export function normalizeOrder(order: any) {
  if (!order || typeof order !== 'object') return order;

  const cargo = getOrderCargo(order);
  const from = getRoutePoint(order, 'from');
  const to = getRoutePoint(order, 'to');

  return {
    ...order,
    route: {
      ...(order.route || {}),
      from: {
        ...(order.route?.from || {}),
        address: from.address || from.label,
        city: from.city || from.label,
        ...(from.coordinates ? { coordinates: from.coordinates } : {}),
      },
      to: {
        ...(order.route?.to || {}),
        address: to.address || to.label,
        city: to.city || to.label,
        ...(to.coordinates ? { coordinates: to.coordinates } : {}),
      },
    },
    cargoDetails: {
      ...(order.cargoDetails || {}),
      description: cargo.description,
      weight: cargo.weight,
      volume: cargo.volume,
    },
  };
}

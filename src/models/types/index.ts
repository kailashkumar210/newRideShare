export type Category = 'history' | 'star' | 'home';

export type Location = {
  title?: string,
  address?: string,
  latitude: number,
  longitude: number,
  latitudeDelta?: number,
  longitudeDelta?: number,
  type?: Category,
  icon?: string,
  placeId?: string,
  position?: number,
};

export type LocationList = Array<Location>;

export type Days = {
  sun: number,
  mon: number,
  tue: number,
  wed: number,
  thu: number,
  fri: number,
  sat: number,
};

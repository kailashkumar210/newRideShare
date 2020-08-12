
class SearchedTrip {    
    id: number = 0;
    startAddressTitle: string = '';
    startAddress: string = '';
    startLatitude: number = 0;
    startLongitude: number = 0;
    destAddressTitle: string = '';
    destAddress: string = '';
    destLatitude: number = 0;
    destLongitude: number = 0;
    startTime: number = 0;
    startRange: number = 0;
    destinationRange: number = 0;
    datetime: number = 0;
    capacity: number = 0;
    days: string = '';
    weekly: boolean = false;
    timeRange: number = 0;
    notifyTripAvailable: boolean = false;
  }
  
  export default SearchedTrip;
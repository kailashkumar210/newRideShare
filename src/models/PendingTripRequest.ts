import Trip from "./Trip";

class PendingTripRequest {
    id: number = 0;
    trip: Trip = new Trip();
    days: string = '';
    passengerCount: number = 0;
    startTime: number = 0;
    endTime: number = 0;
    startLatitude: number = 0;
    startLongitude: number = 0;
    destLatitude: number = 0;
    destLongitude: number = 0;

    constructor(
      id: number,
      trip: Trip,
      days: string,
      passengerCount: number,
      startTime: number,
      endTime: number,
      startLatitude: number,
      startLongitude: number,
      destLatitude: number,
      destLongitude: number
    ) {
      this.id = id;
      this.trip = trip;
      this.days = days;
      this.passengerCount = passengerCount;
      this.startTime = startTime;
      this.endTime = endTime;
      this.startLatitude = startLatitude;
      this.startLongitude = startLongitude;
      this.destLatitude = destLatitude;
      this.destLongitude = destLongitude;
    }
  }
  
  export default PendingTripRequest;
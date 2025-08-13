import sql from 'mssql';

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    if (
      typeof dbConfig.server !== 'string' ||
      typeof dbConfig.database !== 'string' ||
      typeof dbConfig.user !== 'string' ||
      typeof dbConfig.password !== 'string'
    ) {
      throw new Error('Database configuration is incomplete or invalid.');
    }
    pool = await sql.connect(dbConfig as sql.config);
  }
  return pool!;
}

export async function executeStoredProcedure(
  procedureName: string,
  parameters: Record<string, any> = {}
): Promise<any> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    Object.entries(parameters).forEach(([name, value]) => {
      request.input(name, value);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error(`Error executing stored procedure ${procedureName}:`, error);
    throw error;
  }
}

export const storedProcedures = {
  getBookings: () => executeStoredProcedure('dbo.Booking_Read_All'),
  createBooking: (RoomID: number, EmployeeID: number, StartDate: string, EndDate: string) =>
    executeStoredProcedure('dbo.Booking_Create', { RoomID, EmployeeID, StartDate, EndDate }),
  updateBooking: (BookingID: number, RoomID: number, EmployeeID: number, StartDate: string, EndDate: string) =>
    executeStoredProcedure('dbo.Booking_Update', { BookingID, RoomID, EmployeeID, StartDate, EndDate }),
  deleteBooking: (BookingID: number) =>
    executeStoredProcedure('dbo.Booking_Delete', { BookingID }),
  getBookingById: (BookingID: number) =>
    executeStoredProcedure('dbo.Booking_Read_ById', { BookingID }),
  getBookingByEmployee: (EmployeeID: number, includePastBookings: boolean = true) =>
    executeStoredProcedure('dbo.Booking_Read_ByEmployee', { EmployeeID, includePastBookings }),
  getActiveBookings: () =>
    executeStoredProcedure('dbo.Booking_ReadActive'),
  cancelBooking: (BookingID: number) =>
    executeStoredProcedure('dbo.Booking_Cancel', { BookingID }),
  extendBooking: (BookingID: number, newEndDate: string) =>
    executeStoredProcedure('dbo.Booking_Extend', { BookingID, newEndDate }),
  kickEmployeeFromRoom: (EmployeeID: number, RoomID: number) =>
    executeStoredProcedure('dbo.Booking_Kick_Employee_From_Room', { EmployeeID, RoomID }),
  getAvailableRooms: (proposedStartDate: string, proposedEndDate: string) =>
    executeStoredProcedure('dbo.Booking_Read_AvailableRooms', { proposedStartDate, proposedEndDate }),
  getBookingByRoomAndPeriod: (RoomID: number, searchStartDate: string, searchEndDate: string) =>
    executeStoredProcedure('dbo.Booking_Read_ByRoomAndPeriod', { RoomID, searchStartDate, searchEndDate }),
  updateBookingStatus: (BookingID: number, Active: boolean, Finished: boolean) =>
    executeStoredProcedure('dbo.UpdateBookingStatus', { BookingID, Active, Finished }),

  getEmployees: () => executeStoredProcedure('dbo.Employee_Read_All'),
  createEmployee: (FirstName: string, LastName: string, NationalityID: number, PhoneNumber: string, Email: string, JobTitle: string, Salary: number) =>
    executeStoredProcedure('dbo.Employee_Create', { FirstName, LastName, NationalityID, PhoneNumber, Email, JobTitle, Salary }),
  updateEmployee: (EmployeeID: number, FirstName: string, LastName: string, NationalityID: number, PhoneNumber: string, Email: string, JobTitle: string, Salary: number) =>
    executeStoredProcedure('dbo.Employee_Update', { EmployeeID, FirstName, LastName, NationalityID, PhoneNumber, Email, JobTitle, Salary }),
  deleteEmployee: (EmployeeID: number) =>
    executeStoredProcedure('dbo.Employee_Delete', { EmployeeID }),
  getEmployeeById: (EmployeeID: number) =>
    executeStoredProcedure('dbo.Employee_Read_ById', { EmployeeID }),
  calculateEmployeeDiscount: (EmployeeID: number) =>
    executeStoredProcedure('dbo.Employee_Calculate_Discount', { EmployeeID }),
  calculateAllEmployeeDiscounts: () =>
    executeStoredProcedure('dbo.Employee_Calculate_All_Discounts'),

  getRooms: () => executeStoredProcedure('dbo.Room_Read_All'),
  createRoom: (BuildingID: number, RoomNumber: number, RoomType: number, FloorNumber: number, Capacity: number, FreeBeds: number) =>
    executeStoredProcedure('dbo.Room_Create', { BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds }),
  updateRoom: (RoomID: number, BuildingID: number, RoomNumber: number, RoomType: number, FloorNumber: number, Capacity: number, FreeBeds: number) =>
    executeStoredProcedure('dbo.Room_Update', { RoomID, BuildingID, RoomNumber, RoomType, FloorNumber, Capacity, FreeBeds }),
  deleteRoom: (RoomID: number) =>
    executeStoredProcedure('dbo.Room_Delete', { RoomID }),
  getRoomById: (RoomID: number) =>
    executeStoredProcedure('dbo.Room_Read_ById', { RoomID }),
  updateRoomBeds: (RoomID: number, Capacity: number) =>
    executeStoredProcedure('dbo.UpdateRoomBeds', { RoomID, Capacity }),

  getCamps: () => executeStoredProcedure('dbo.Campus_Read_All'),
  createCamp: (CampusName: string, City: number) =>
    executeStoredProcedure('dbo.Campus_Create', { CampusName, City }),
  updateCamp: (CampusID: number, CampusName: string, City: number) =>
    executeStoredProcedure('dbo.Campus_Update', { CampusID, CampusName, City }),
  deleteCamp: (CampusID: number) =>
    executeStoredProcedure('dbo.Campus_Delete', { CampusID }),
  getCampById: (CampusID: number) =>
    executeStoredProcedure('dbo.Campus_Read_ById', { CampusID }),

  getBuildings: () => executeStoredProcedure('dbo.Building_Read_All'),
  createBuilding: (CampusID: number, NumberOfFloors: number) =>
    executeStoredProcedure('dbo.Building_Create', { CampusID, NumberOfFloors }),
  updateBuilding: (BuildingID: number, CampusID: number, NumberOfFloors: number) =>
    executeStoredProcedure('dbo.Building_Update', { BuildingID, CampusID, NumberOfFloors }),
  deleteBuilding: (BuildingID: number) =>
    executeStoredProcedure('dbo.Building_Delete', { BuildingID }),
  getBuildingById: (BuildingID: number) =>
    executeStoredProcedure('dbo.Building_Read_ById', { BuildingID }),

  getCities: () => executeStoredProcedure('dbo.Cities_Read_All'),
  createCity: (CityName: string) =>
    executeStoredProcedure('dbo.Cities_Create', { CityName }),
  updateCity: (CityID: number, CityName: string) =>
    executeStoredProcedure('dbo.Cities_Update', { CityID, CityName }),
  deleteCity: (CityID: number) =>
    executeStoredProcedure('dbo.Cities_Delete', { CityID }),
  getCityById: (CityID: number) =>
    executeStoredProcedure('dbo.Cities_Read_ById', { CityID }),

  getNationalities: () => executeStoredProcedure('dbo.Nationalities_Read_All'),
  createNationality: (Nationality: string) =>
    executeStoredProcedure('dbo.Nationalities_Create', { Nationality }),
  updateNationality: (NationalityID: number, Nationality: string) =>
    executeStoredProcedure('dbo.Nationalities_Update', { NationalityID, Nationality }),
  deleteNationality: (NationalityID: number) =>
    executeStoredProcedure('dbo.Nationalities_Delete', { NationalityID }),
  getNationalityById: (NationalityID: number) =>
    executeStoredProcedure('dbo.Nationalities_Read_ById', { NationalityID }),

  getRoomTypes: () => executeStoredProcedure('dbo.RoomTypes_Read_All'),
  createRoomType: (RoomType: string) =>
    executeStoredProcedure('dbo.RoomTypes_Create', { RoomType }),
  updateRoomType: (RoomTypeID: number, RoomType: string) =>
    executeStoredProcedure('dbo.RoomTypes_Update', { RoomTypeID, RoomType }),
  deleteRoomType: (RoomTypeID: number) =>
    executeStoredProcedure('dbo.RoomTypes_Delete', { RoomTypeID }),
  getRoomTypeById: (RoomTypeID: number) =>
    executeStoredProcedure('dbo.RoomTypes_Read_ById', { RoomTypeID }),
};

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

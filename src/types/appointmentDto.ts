import { UserDto } from "./userDtos";

export interface AppointmentDto {
    id: string;
    courseId: string;
    startTime: string; // ISO string format for Date
    ownerId: string;
    courseApplicationId?: string | null; // Nullable
    participants: UserDto[];
    acceptedByOwner: boolean;
    pending: boolean;
  }
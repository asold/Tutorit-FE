import axios from 'axios';
import { SERVER_ADDRESS } from '../../../common/constants.ts';


export enum ApplicationStatus {
    Pending = 0,    
    Approved = 1,  
    Rejected = 2,  
}

export async function changeCourseApplicationStatus(courseApplicationId: string, tutorId: string, applicationStatus: ApplicationStatus, token:string, courseId:string) {
    
    
    try {
        const response = await axios.put(`${SERVER_ADDRESS}/tutorit/Teacher/course_approval?courseId=${courseId}`, {
            courseApplicationId,
            tutorId,
            applicationStatus,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(response)

        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error sending request:", error);
    }
}


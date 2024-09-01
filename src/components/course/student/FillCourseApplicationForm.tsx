import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch
import { applyForCourse } from '../../../actions/course/courseActions.ts';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

interface FillCourseApplicationFormProps {
  open: boolean;
  onClose: () => void;
  courseId: string | null;
  token: string;
  onSuccess: () => void;
}

const FillCourseApplicationForm: React.FC<FillCourseApplicationFormProps> = ({ open, onClose, courseId,  onSuccess }) => {
  const { t } = useTranslation();
  const [studentSideNote, setStudentSideNote] = useState<string>('');
  const [firstMeetingDate, setFirstMeetingDate] = useState<Dayjs | null>(null);
  const [firstMeetingTime, setFirstMeetingTime] = useState<Dayjs | null>(null);

  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();


  const handleSubmitApplication = async () => {
    if (!courseId) return;

    const userId = localStorage.getItem('userId');
    const firstMeeting = firstMeetingDate && firstMeetingTime
      ? firstMeetingDate.hour(firstMeetingTime.hour()).minute(firstMeetingTime.minute()).toDate()
      : null;

    const applicationData = {
      courseId,
      studentId: userId,
      studentSideNote,
      firstMeeting,
    };

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${SERVER_ADDRESS}/tutorit/Student/course_application`,
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      // Dispatch the action here!
      dispatch(applyForCourse(courseId)); // Dispatch your action with the courseId

      onSuccess();
      onClose();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('Apply for Course')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('Your message to the tutor')}
            multiline
            rows={4}
            value={studentSideNote}
            onChange={(e) => setStudentSideNote(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 300 }}
          />
          <DatePicker
            label={t('Select first meeting date')}
            value={firstMeetingDate}
            onChange={(date) => setFirstMeetingDate(date)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <TimePicker
            label={t('Select first meeting time')}
            value={firstMeetingTime}
            onChange={(time) => setFirstMeetingTime(time)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            {t('Cancel')}
          </Button>
          <Button onClick={handleSubmitApplication} color="primary">
            {t('Submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FillCourseApplicationForm;

package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Appointment;
import com.example.pawtopia.pawtopia.ecommerce.Repository.AppointmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    @Autowired
    private AppointmentRepo appointmentRepo;

    //read
    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    //create
    public Appointment addAppointment(Appointment appointment) {
        return appointmentRepo.save(appointment);
    }

    //update
    public Appointment updateAppointment(Long appId,Appointment appointment) {

        Appointment existingAppointment = appointmentRepo.findById(appId)
                .orElseThrow(() -> new NoSuchElementException("Appointment with id " + appId + " not found"));

        // Update fields
//        existingAppointment.setCustomerId(appointment.getCustomerId());
        existingAppointment.setEmail(appointment.getEmail());
        existingAppointment.setContactNo(appointment.getContactNo());
        existingAppointment.setDate(appointment.getDate());


        return appointmentRepo.save(existingAppointment);
    }

    //delete
    public String deleteAppointment(Long appId) {
        Optional<Appointment> appointment = appointmentRepo.findById(appId);

        if (appointment.isPresent()) {
            appointmentRepo.delete(appointment.get());
            return "Appointment successfully canceled.";
        } else {
            return "Appointment with ID " + appId + " not found.";
        }
    }

    //put
    public String updateAppointment(Appointment appointment) {
        try {
            appointmentRepo.save(appointment); // Save the updated appointment to the database
            return "Appointment successfully updated.";
        } catch (Exception e) {
            return "Error updating appointment: " + e.getMessage();
        }
    }

    public Appointment getAppointmentById(Long appId) {
        return appointmentRepo.findById(appId).orElse(null); // Find the appointment by ID
    }

    public List<Appointment> getAppointmentsByUserEmail(String email) {
        return appointmentRepo.findByUserEmail(email);
    }

}

package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Appointment;
import com.example.pawtopia.pawtopia.ecommerce.Service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/getAppointment")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping("/postAppointment")
    public Appointment addAppointment(@RequestBody Appointment appointment) {
        return appointmentService.addAppointment(appointment);
    }

    @PutMapping("/putAppointment/{appid}")
    public Appointment updateAppointment(@PathVariable Long appId,@RequestBody Appointment appointment) {
        return appointmentService.updateAppointment(appId, appointment);
    }

    @DeleteMapping("/deleteAppointment/{appid}")
    public String deleteCourse(@PathVariable Long appId) {
        return appointmentService.deleteAppointment(appId);
    }


    @PutMapping("/cancel/{appid}")
    public ResponseEntity<String> cancelAppointment(@PathVariable Long appId) {
        // Find the appointment by appid
        Appointment appointment = appointmentService.getAppointmentById(appId);
        if (appointment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found.");
        }

        // Update the canceled flag to true
        appointment.setCanceled(true);

        // Save the updated appointment to the database
        String response = appointmentService.updateAppointment(appointment); // Ensure you have a method to update the appointment

        if (response.equals("Appointment successfully updated.")) {
            return ResponseEntity.ok("Appointment successfully canceled.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to cancel appointment.");
        }
    }

    @PutMapping("/confirm/{appid}")
    public ResponseEntity<String> confirmAppointment(@PathVariable Long appId) {
        // Find the appointment by appid
        Appointment appointment = appointmentService.getAppointmentById(appId);

        if (appointment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found.");
        }

        // Check if the appointment has already been confirmed
        if (appointment.isConfirmed()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Appointment is already confirmed.");
        }
        // Update the confirmed flag to true
        appointment.setConfirmed(true);

        // Save the updated appointment to the database
        String response = appointmentService.updateAppointment(appointment);

        if (response.equals("Appointment successfully updated.")) {
            return ResponseEntity.ok("Appointment successfully confirmed.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to confirm appointment.");
        }
    }

    @GetMapping("/byUserEmail/{email}")
    public List<Appointment> getAppointmentsByUserEmail(@PathVariable String email) {
        return appointmentService.getAppointmentsByUserEmail(email);
    }

}

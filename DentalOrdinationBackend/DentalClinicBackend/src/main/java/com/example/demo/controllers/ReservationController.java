package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Reservation;
import com.example.demo.services.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
	private final ReservationService reservationService;

	public ReservationController(ReservationService reservationService) {
		this.reservationService = reservationService;
	}

	@PostMapping
	public Reservation createReservation(@RequestBody Reservation reservation) {
		return reservationService.createReservation(reservation);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> cancelReservation(@PathVariable Long id) {
		reservationService.cancelReservation(id);
		return ResponseEntity.ok("Reservation canceled successfully.");
	}

	@GetMapping
	public List<Reservation> getAllReservations() {
		return reservationService.getAllReservations();
	}
}

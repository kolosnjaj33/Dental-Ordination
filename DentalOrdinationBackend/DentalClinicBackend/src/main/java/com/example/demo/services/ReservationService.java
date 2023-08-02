package com.example.demo.services;

import org.springframework.stereotype.Service;

import com.example.demo.models.Reservation;
import com.example.demo.repositories.ReservationRepository;

import java.util.List;

@Service
public class ReservationService {
	private final ReservationRepository reservationRepository;

	// Konstruktor klase ReservationService
	public ReservationService(ReservationRepository reservationRepository) {
		this.reservationRepository = reservationRepository;
	}

	// Metoda za kreiranje nove rezervacije
	public Reservation createReservation(Reservation reservation) {
		return reservationRepository.save(reservation);
	}

	// Metoda za otkazivanje rezervacije po ID-u rezervacije
	public void cancelReservation(Long reservationId) {
		reservationRepository.deleteById(reservationId);
	}

	// Metoda za vraćanje svih rezervacija
	public List<Reservation> getAllReservations() {
		return reservationRepository.findAll();
	}

}

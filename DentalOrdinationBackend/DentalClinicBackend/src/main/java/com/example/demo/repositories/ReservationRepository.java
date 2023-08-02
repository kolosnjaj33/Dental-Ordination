package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
	List<Reservation> findAll();

}

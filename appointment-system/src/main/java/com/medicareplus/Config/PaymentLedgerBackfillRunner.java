package com.medicareplus.Config;

import com.medicareplus.Models.Appointment;
import com.medicareplus.Repository.AppointmentRepository;
import com.medicareplus.Service.AppointmentServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentLedgerBackfillRunner implements ApplicationRunner {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentServiceImpl appointmentService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Appointment> missingPaymentRecords = appointmentRepository.findCompletedWithoutPaymentRecord();
        if (missingPaymentRecords.isEmpty()) {
            return;
        }

        for (Appointment appointment : missingPaymentRecords) {
            appointmentService.createPaymentRecordForCompletedAppointment(appointment);
        }

        log.info("Payment ledger backfill completed: {} records created.", missingPaymentRecords.size());
    }
}


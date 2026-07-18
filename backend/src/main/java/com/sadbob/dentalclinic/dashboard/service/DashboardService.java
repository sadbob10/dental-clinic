package com.sadbob.dentalclinic.dashboard.service;

import com.sadbob.dentalclinic.dashboard.dto.DentistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.dto.ReceptionistDashboardResponse;

import java.time.LocalDate;

public interface DashboardService {

    ReceptionistDashboardResponse getReceptionistDashboard(LocalDate date);

    DentistDashboardResponse getDentistDashboard(String email);

}
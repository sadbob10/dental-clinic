package com.sadbob.dentalclinic.dashboard.service;

import com.sadbob.dentalclinic.dashboard.dto.DentistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.dto.ReceptionistDashboardResponse;

public interface DashboardService {

    ReceptionistDashboardResponse getReceptionistDashboard();

    DentistDashboardResponse getDentistDashboard(String email);
}
package com.medicareplus.Repository;

import com.medicareplus.Models.LabTest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Integer> {
    List<LabTest> findByLabId(Integer labId);
}

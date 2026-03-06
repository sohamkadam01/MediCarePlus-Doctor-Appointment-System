package com.medicareplus.Repository;

import com.medicareplus.Models.LabEnrollmentApplication;
import com.medicareplus.Models.LabEnrollmentStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabEnrollmentRepository extends JpaRepository<LabEnrollmentApplication, Integer> {
    
    List<LabEnrollmentApplication> findByCityIgnoreCaseAndStatus(String city, LabEnrollmentStatus status);
    
    List<LabEnrollmentApplication> findByCityIgnoreCaseAndStateIgnoreCaseAndStatus(
        String city, String state, LabEnrollmentStatus status);
    
    @Query("SELECT l FROM LabEnrollmentApplication l WHERE " +
           "LOWER(l.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(l.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "l.pincode LIKE CONCAT('%', :location, '%')")
    List<LabEnrollmentApplication> searchByLocation(@Param("location") String location);
    
    @Query("SELECT DISTINCT l.city FROM LabEnrollmentApplication l WHERE l.status = 'APPROVED' AND l.city IS NOT NULL")
    List<String> findAllCities();
    
    @Query("SELECT DISTINCT l.state FROM LabEnrollmentApplication l WHERE l.status = 'APPROVED' AND l.state IS NOT NULL")
    List<String> findAllStates();
    
    List<LabEnrollmentApplication> findByPincode(String pincode);
    
    List<LabEnrollmentApplication> findByCityIgnoreCaseAndHomeCollectionTrueAndStatus(
        String city, LabEnrollmentStatus status);
    
    List<LabEnrollmentApplication> findByNablAccreditedTrueAndStatus(LabEnrollmentStatus status);
    
    List<LabEnrollmentApplication> findByIsoCertifiedTrueAndStatus(LabEnrollmentStatus status);
    
    List<LabEnrollmentApplication> findByCapAccreditedTrueAndStatus(LabEnrollmentStatus status);
    
    // FIXED: Remove LOWER() function or cast the CLOB to string
    @Query("SELECT l FROM LabEnrollmentApplication l WHERE " +
           "l.testCategories LIKE CONCAT('%', :category, '%') AND " +
           "l.status = :status")
    List<LabEnrollmentApplication> findByTestCategoryContainingAndStatus(
        @Param("category") String category, 
        @Param("status") LabEnrollmentStatus status);
    
    // Alternative if you need case-insensitive search
    @Query(value = "SELECT * FROM lab_enrollments WHERE " +
           "LOWER(test_categories) LIKE LOWER(CONCAT('%', :category, '%')) AND " +
           "status = :status", 
           nativeQuery = true)
    List<LabEnrollmentApplication> findByTestCategoryNative(
        @Param("category") String category, 
        @Param("status") String status);
    
    List<LabEnrollmentApplication> findByYearEstablishedGreaterThanEqualAndStatus(
        Integer year, LabEnrollmentStatus status);
    
    List<LabEnrollmentApplication> findByReportTurnaroundLessThanEqualAndStatus(
        Integer hours, LabEnrollmentStatus status);
    
    @Query("SELECT l FROM LabEnrollmentApplication l WHERE " +
           "l.status = :status AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:state IS NULL OR LOWER(l.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:homeCollection IS NULL OR l.homeCollection = :homeCollection) AND " +
           "(:emergencyServices IS NULL OR l.emergencyServices = :emergencyServices)")
    List<LabEnrollmentApplication> advancedSearch(
        @Param("status") LabEnrollmentStatus status,
        @Param("city") String city,
        @Param("state") String state,
        @Param("homeCollection") Boolean homeCollection,
        @Param("emergencyServices") Boolean emergencyServices);

    Optional<LabEnrollmentApplication> findFirstByEmailOrderByUpdatedAtDesc(String email);
}

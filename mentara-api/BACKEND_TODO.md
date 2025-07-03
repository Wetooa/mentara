# Backend TODO List for Therapist Application

## Missing Fields Analysis (Frontend → Backend)

After analyzing the Prisma schema vs. current form implementation, the following fields are present in the database but missing from the application form:

### High Priority - Should be added to form:

1. **`yearsOfExperience`** (Int?)
   - Experience in years as a licensed professional
   - Important for qualification assessment
   - Should be added to Professional Profile section

2. **`educationBackground`** (String?)
   - Educational background details
   - Important for credential verification
   - Should be added to Professional Profile section

3. **`practiceLocation`** (String?)
   - Primary practice location
   - Important for client matching
   - Should be added to Basic Information section

4. **`acceptsInsurance`** (Boolean)
   - Whether therapist accepts insurance
   - Critical for client matching
   - Should be added to Availability & Services section

5. **`acceptedInsuranceTypes`** (String[])
   - Types of insurance accepted (if acceptsInsurance is true)
   - Important for client filtering
   - Should be added to Availability & Services section

6. **`sessionLength`** (String)
   - Standard session length (different from preferred)
   - Important for booking system
   - Should be added to Availability & Services section

### Medium Priority - Consider adding:

7. **`specialCertifications`** (String[])
   - Additional certifications beyond basic license
   - Enhances profile credibility
   - Could be added to Professional Profile section

8. **`illnessSpecializations`** (String[])
   - Specific mental health conditions they specialize in
   - Important for client matching
   - Could be added to Areas of Expertise section

9. **`acceptTypes`** (String[])
   - Types of clients they accept (adults, children, couples, etc.)
   - Important for client matching
   - Could be added to Professional Profile section

### Low Priority - Admin/System managed:

10. **`licenseVerified`** related fields
    - Admin verification fields
    - Should remain backend-only

11. **`treatmentSuccessRates`** (Json)
    - Performance metrics
    - Should be system-calculated, not user-input

12. **`certifications`** (Json?)
    - Complex certification objects
    - Might be better as file uploads

## Backend Updates Needed:

1. **Update DTO validation** to handle new fields
2. **Modify submission endpoint** to process additional fields
3. **Update database seed data** to include new fields
4. **Add validation rules** for insurance-related fields
5. **Consider field dependencies** (e.g., acceptedInsuranceTypes only if acceptsInsurance is true)

## Form Flow Improvements:

1. **Conditional fields** based on selections (insurance types, certifications)
2. **Field validation** for experience years, education format
3. **Progressive disclosure** for optional advanced fields
4. **Help text and examples** for complex fields like education background

## Next Steps:

1. Add high-priority fields to frontend form
2. Update Zod schema with new field validations
3. Test form submission with new fields
4. Update backend DTO and processing logic
5. Add appropriate UI components for new field types
package com.musterstadt.startup;

import com.musterstadt.model.*;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.Calendar;
import java.util.Date;
import java.util.logging.Logger;

/**
 * Fires on startup and seeds the database with realistic German test data.
 * Uses JPA directly — no DAO layer here to avoid circular dependency during startup.
 */
@Singleton
@Startup
public class DataInitializer {

    private static final Logger LOGGER = Logger.getLogger(DataInitializer.class.getName());

    @PersistenceContext(unitName = "BuergerportalPU")
    private EntityManager em;

    @PostConstruct
    public void init() {
        createSchema();

        long count = (Long) em.createQuery("SELECT COUNT(c) FROM Citizen c").getSingleResult();
        if (count > 0) {
            LOGGER.info("DataInitializer: Daten bereits vorhanden, überspringe Seed.");
            return;
        }

        LOGGER.info("DataInitializer: Lade Testdaten...");

        // ---- Citizens ----
        Citizen mueller    = citizen("Hans",     "Müller",    "Hauptstraße",       "12",   "80331", "München",  "hans.mueller@example.de",    "089-123456");
        Citizen schmidt    = citizen("Maria",    "Schmidt",   "Bahnhofstraße",     "5",    "80335", "München",  "maria.schmidt@example.de",   "089-654321");
        Citizen schneider  = citizen("Klaus",    "Schneider", "Marienplatz",       "1",    "80331", "München",  "k.schneider@example.de",     "089-112233");
        Citizen fischer    = citizen("Anna",     "Fischer",   "Schillerstraße",    "33a",  "80336", "München",  "a.fischer@example.de",       "089-334455");
        Citizen weber      = citizen("Peter",    "Weber",     "Münchner Straße",   "78",   "80337", "München",  "p.weber@example.de",         "089-556677");
        Citizen meyer      = citizen("Sabine",   "Meyer",     "Maximilianstraße",  "4",    "80539", "München",  "s.meyer@example.de",         "089-778899");
        Citizen wagner     = citizen("Thomas",   "Wagner",    "Leopoldstraße",     "90",   "80802", "München",  "t.wagner@example.de",        "089-990011");
        Citizen becker     = citizen("Ursula",   "Becker",    "Rosenheimer Str.",  "21",   "81667", "München",  "u.becker@example.de",        "089-112244");
        Citizen schulz     = citizen("Michael",  "Schulz",    "Sendlinger Str.",   "7",    "80331", "München",  "m.schulz@example.de",        "089-334466");
        Citizen hofmann    = citizen("Elisabeth","Hofmann",   "Schwanthalerstraße","55",   "80336", "München",  "e.hofmann@example.de",       "089-556688");
        Citizen braun      = citizen("Dieter",   "Braun",     "Nymphenburger Str.","102",  "80636", "München",  "d.braun@example.de",         "089-778800");
        Citizen zimmermann = citizen("Ingrid",   "Zimmermann","Dachauer Straße",   "67",   "80335", "München",  "i.zimmermann@example.de",    "089-990022");

        em.persist(mueller);
        em.persist(schmidt);
        em.persist(schneider);
        em.persist(fischer);
        em.persist(weber);
        em.persist(meyer);
        em.persist(wagner);
        em.persist(becker);
        em.persist(schulz);
        em.persist(hofmann);
        em.persist(braun);
        em.persist(zimmermann);
        em.flush();

        // ---- Parking Applications ----
        Application parkApp1 = application(mueller,    ApplicationType.PARKING,  ApplicationStatus.APPROVED,  daysAgo(90), daysAgo(85));
        Application parkApp2 = application(schmidt,    ApplicationType.PARKING,  ApplicationStatus.PENDING,   daysAgo(10), daysAgo(10));
        Application parkApp3 = application(schneider,  ApplicationType.PARKING,  ApplicationStatus.REJECTED,  daysAgo(60), daysAgo(55));
        Application parkApp4 = application(fischer,    ApplicationType.PARKING,  ApplicationStatus.APPROVED,  daysAgo(120),daysAgo(115));
        Application parkApp5 = application(weber,      ApplicationType.PARKING,  ApplicationStatus.PENDING,   daysAgo(5),  daysAgo(5));
        Application parkApp6 = application(meyer,      ApplicationType.PARKING,  ApplicationStatus.APPROVED,  daysAgo(200),daysAgo(195));

        em.persist(parkApp1);
        em.persist(parkApp2);
        em.persist(parkApp3);
        em.persist(parkApp4);
        em.persist(parkApp5);
        em.persist(parkApp6);
        em.flush();

        // ---- Parking Permits ----
        em.persist(new ParkingPermit(parkApp1, "M-HM 1234", "Zone A",       "/uploads/mueller_nachweis.pdf"));
        em.persist(new ParkingPermit(parkApp2, "M-SC 5678", "Innenstadt",   null));
        em.persist(new ParkingPermit(parkApp3, "M-KS 9012", "Zone B",       "/uploads/schneider_nachweis.pdf"));
        em.persist(new ParkingPermit(parkApp4, "M-AF 3456", "Zone A",       "/uploads/fischer_nachweis.pdf"));
        em.persist(new ParkingPermit(parkApp5, "M-PW 7890", "Zone C",       null));
        em.persist(new ParkingPermit(parkApp6, "M-SM 2345", "Zone B",       "/uploads/meyer_nachweis.pdf"));
        em.flush();

        // ---- Address Change Applications ----
        Application addrApp1 = application(wagner,     ApplicationType.ADDRESS,  ApplicationStatus.APPROVED,  daysAgo(30), daysAgo(28));
        Application addrApp2 = application(becker,     ApplicationType.ADDRESS,  ApplicationStatus.PENDING,   daysAgo(3),  daysAgo(3));
        Application addrApp3 = application(schulz,     ApplicationType.ADDRESS,  ApplicationStatus.REJECTED,  daysAgo(45), daysAgo(42));
        Application addrApp4 = application(zimmermann, ApplicationType.ADDRESS,  ApplicationStatus.PENDING,   daysAgo(1),  daysAgo(1));

        em.persist(addrApp1);
        em.persist(addrApp2);
        em.persist(addrApp3);
        em.persist(addrApp4);
        em.flush();

        // ---- Dog Registrations ----
        em.persist(new DogRegistration(mueller,    "Rex",      "Schäferhund",        daysAgo(180), "276094500108890"));
        em.persist(new DogRegistration(schmidt,    "Bello",    "Labrador Retriever", daysAgo(300), "276094500221445"));
        em.persist(new DogRegistration(schneider,  "Waldi",    "Dackel",             daysAgo(500), "276094500334220"));
        em.persist(new DogRegistration(fischer,    "Luna",     "Golden Retriever",   daysAgo(90),  "276094500445110"));
        em.persist(new DogRegistration(weber,      "Max",      "Dobermann",          daysAgo(400), "276094500556887"));
        em.persist(new DogRegistration(meyer,      "Hasso",    "Schäferhund",        daysAgo(730), "276094500667664"));
        em.persist(new DogRegistration(wagner,     "Frieda",   "Pudel",              daysAgo(60),  "276094500778441"));
        em.persist(new DogRegistration(becker,     "Bruno",    "Boxer",              daysAgo(150), "276094500889218"));
        em.persist(new DogRegistration(schulz,     "Susi",     "Dackel",             daysAgo(220), "276094500990995"));
        em.persist(new DogRegistration(hofmann,    "Pia",      "Beagle",             daysAgo(45),  "276094501101772"));
        em.persist(new DogRegistration(braun,      "Karl",     "Rottweiler",         daysAgo(365), "276094501212549"));
        em.flush();

        LOGGER.info("DataInitializer: Testdaten erfolgreich geladen.");
    }

    private Citizen citizen(String firstName, String lastName, String street, String houseNumber,
                            String postcode, String city, String email, String phone) {
        Calendar cal = Calendar.getInstance();
        cal.set(2010, Calendar.JANUARY, 15);
        return new Citizen(firstName, lastName, street, houseNumber, postcode, city, email, phone, cal.getTime());
    }

    private Application application(Citizen citizen, ApplicationType type, ApplicationStatus status,
                                    Date created, Date updated) {
        return new Application(citizen, type, status, created, updated);
    }

    private Date daysAgo(int days) {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -days);
        return cal.getTime();
    }

    /**
     * Creates the schema via native DDL. Called after the component context is
     * fully live, so Liberty provides a real connection (not a stub).
     * hbm2ddl.auto=none prevents Hibernate from attempting this at SessionFactory
     * init time when only a GenericConnection stub is available.
     */
    private void createSchema() {
        // Drop in reverse FK order
        em.createNativeQuery("DROP TABLE IF EXISTS DOG_REGISTRATION").executeUpdate();
        em.createNativeQuery("DROP TABLE IF EXISTS PARKING_PERMIT").executeUpdate();
        em.createNativeQuery("DROP TABLE IF EXISTS APPLICATION").executeUpdate();
        em.createNativeQuery("DROP TABLE IF EXISTS CITIZEN").executeUpdate();

        em.createNativeQuery(
            "CREATE TABLE CITIZEN (" +
            "  ID BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "  FIRST_NAME VARCHAR(100) NOT NULL," +
            "  LAST_NAME VARCHAR(100) NOT NULL," +
            "  STREET VARCHAR(200)," +
            "  HOUSE_NUMBER VARCHAR(20)," +
            "  POSTCODE VARCHAR(10)," +
            "  CITY VARCHAR(100)," +
            "  EMAIL VARCHAR(200)," +
            "  PHONE VARCHAR(50)," +
            "  REGISTERED_DATE DATE" +
            ")").executeUpdate();

        em.createNativeQuery(
            "CREATE TABLE APPLICATION (" +
            "  ID BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "  CITIZEN_ID BIGINT NOT NULL," +
            "  TYPE VARCHAR(20) NOT NULL," +
            "  STATUS VARCHAR(20) NOT NULL," +
            "  CREATED_DATE DATE NOT NULL," +
            "  LAST_UPDATED DATE," +
            "  NOTES VARCHAR(500)," +
            "  FOREIGN KEY (CITIZEN_ID) REFERENCES CITIZEN(ID)" +
            ")").executeUpdate();

        em.createNativeQuery(
            "CREATE TABLE PARKING_PERMIT (" +
            "  ID BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "  APPLICATION_ID BIGINT NOT NULL UNIQUE," +
            "  VEHICLE_REGISTRATION VARCHAR(20) NOT NULL," +
            "  ZONE VARCHAR(50)," +
            "  PROOF_DOCUMENT_PATH VARCHAR(500)," +
            "  FOREIGN KEY (APPLICATION_ID) REFERENCES APPLICATION(ID)" +
            ")").executeUpdate();

        em.createNativeQuery(
            "CREATE TABLE DOG_REGISTRATION (" +
            "  ID BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "  CITIZEN_ID BIGINT NOT NULL," +
            "  DOG_NAME VARCHAR(100) NOT NULL," +
            "  BREED VARCHAR(100)," +
            "  REGISTRATION_DATE DATE NOT NULL," +
            "  CHIP_NUMBER VARCHAR(50)," +
            "  FOREIGN KEY (CITIZEN_ID) REFERENCES CITIZEN(ID)" +
            ")").executeUpdate();

        LOGGER.info("DataInitializer: Schema erstellt.");
    }
}

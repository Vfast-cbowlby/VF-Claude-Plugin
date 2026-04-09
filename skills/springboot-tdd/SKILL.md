---
name: springboot-tdd
description: Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo. Use when adding features, fixing bugs, or refactoring.
origin: ECC
---

# Spring Boot TDD Workflow

TDD guidance for Spring Boot services with 80%+ coverage (unit + integration).

## When to Use

- New features or endpoints
- Bug fixes or refactors
- Adding data access logic or security rules

## Workflow

1) Write tests first (they should fail)
2) Implement minimal code to pass
3) Refactor with tests green
4) Enforce coverage (JaCoCo)

## Unit Tests (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class MarketServiceTest {
  @Mock MarketRepository repo;
  @InjectMocks MarketService service;

  @Test
  void createsMarket() {
    CreateMarketRequest req = new CreateMarketRequest("name", "desc", Instant.now(), List.of("cat"));
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Market result = service.create(req);

    assertThat(result.name()).isEqualTo("name");
    verify(repo).save(any());
  }
}
```

Patterns:
- Arrange-Act-Assert
- Avoid partial mocks; prefer explicit stubbing
- Use `@ParameterizedTest` for variants

## Web Layer Tests (MockMvc)

```java
@WebMvcTest(MarketController.class)
class MarketControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean MarketService marketService;

  @Test
  void returnsMarkets() throws Exception {
    when(marketService.list(any())).thenReturn(Page.empty());

    mockMvc.perform(get("/api/markets"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray());
  }
}
```

## Integration Tests (SpringBootTest)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketIntegrationTest {
  @Autowired MockMvc mockMvc;

  @Test
  void createsMarket() throws Exception {
    mockMvc.perform(post("/api/markets")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"Test","description":"Desc","endDate":"2030-01-01T00:00:00Z","categories":["general"]}
        """))
      .andExpect(status().isCreated());
  }
}
```

## Persistence Tests (DataJpaTest)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestContainersConfig.class)
class MarketRepositoryTest {
  @Autowired MarketRepository repo;

  @Test
  void savesAndFinds() {
    MarketEntity entity = new MarketEntity();
    entity.setName("Test");
    repo.save(entity);

    Optional<MarketEntity> found = repo.findByName("Test");
    assertThat(found).isPresent();
  }
}
```

## Testcontainers

- Use reusable containers for Postgres/Redis to mirror production
- Wire via `@DynamicPropertySource` to inject JDBC URLs into Spring context

## Coverage (JaCoCo)

Maven snippet:
```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.14</version>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>
```

## Assertions

- Prefer AssertJ (`assertThat`) for readability
- For JSON responses, use `jsonPath`
- For exceptions: `assertThatThrownBy(...)`

## Test Data Builders

```java
class MarketBuilder {
  private String name = "Test";
  MarketBuilder withName(String name) { this.name = name; return this; }
  Market build() { return new Market(null, name, MarketStatus.ACTIVE); }
}
```

## Phase 0: Pre-Push Gate (MANDATORY)

Run these checks **before** any `git push`. CI is a confirmation gate, not a first-run environment.

### If any `*IT.java` file was created or modified

Run integration tests locally first. A FK violation that takes 10 minutes in CI takes 30 seconds locally:

```bash
./mvnw test -Dtest="*IT" -DfailIfNoTests=false -pl <module>
```

**Before writing `@BeforeEach` cleanup**: grep migration files for the actual `CREATE TABLE` names — never assume from entity class names. Run the test at least once green locally before pushing.

### If any Docker image reference was added to pipeline or compose YAML

Verify the image exists and the tag resolves before committing:

```bash
docker pull <registry>/<image>:<tag>
```

Note: Docker Hub and GitHub Container Registry (`ghcr.io`) are separate registries — an image that exists on one may not exist on the other.

### If a validation script and a fixture/stub file were added in the same PR

Run the script against the fixture before opening the PR. A script and the file it validates must be consistent from the first commit.

### If a hotfix is targeting the main branch directly

Apply the same pre-push gate. A test that has never run green must not land on main — it propagates broken state to every downstream branch.

---

## Integration Test Cleanup (@BeforeEach / @AfterEach)

When an integration test inserts rows into a table that has FK children, the cleanup must delete children before the parent. **Never guess table names** — always derive them from the migration files.

### Step 1: Find FK children before writing cleanup code

```bash
grep -rn "REFERENCES <parent_table>" src/main/resources/db/changelog/migrations/
```

Entity class names often differ from DDL table names. Always use the actual `CREATE TABLE` name from migrations, not the Java class name.

### Step 2: Delete using JdbcTemplate, not repositories

Prefer a single `JdbcTemplate` over per-table repositories — it stays correct as new child tables are added:

```java
@Autowired JdbcTemplate jdbcTemplate;

@BeforeEach
void cleanUp() {
    // Delete FK children deepest-first, parent last.
    // Table names must match CREATE TABLE in migrations.
    jdbcTemplate.execute("DELETE FROM <child_table>");
    jdbcTemplate.execute("DELETE FROM <parent_table>");
}
```

### Step 3: Run ITs locally before pushing

Never let CI be the first run of a new or modified `*IT.java` file:

```bash
./mvnw test -Dtest="*IT" -DfailIfNoTests=false -pl <module>
```

A FK violation that takes 10 minutes in CI takes 30 seconds locally.

---

## CI Commands

- Maven: `mvn -T 4 test` or `mvn verify`
- Gradle: `./gradlew test jacocoTestReport`

**Remember**: Keep tests fast, isolated, and deterministic. Test behavior, not implementation details.

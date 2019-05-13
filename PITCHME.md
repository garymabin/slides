## Efficient Spring Data JPA
---
### Query
Query is always the headache
+++
**Derived JPA query**
```java
@Repository
public interface WorkPackageRepository extends JpaRepository<WorkPackageRecord, String>
    Optional<WorkPackageRecord> findOneByName(String name);

    @Async
    ListenableFuture<List<WorkPackageRecord>> findAll();
}
```
+++
@ul
Pros.
- Simple and Powerful.
- Supports Paging and Sorting.
- Supports result Streaming.
- Supports Async Query
Cons:
- Only supports simple conditions.
- Only supports no more than two parameters.
@ulend
+++
#### @Query(JPQL/HQL)
```java
@Repository
public interface AircraftRepository extends JpaRepository<AircraftRecord, Long> {

    @Query("SELECT a FROM AircraftRecord a join fetch a.workPackages WHERE a.tailNumber = :tailNumber")
    Optional<AircraftRecord> findByTailNumberWithWorkPackages(@Param("tailNumber") String tailNumber);
}
```
+++
@ul
Pros.
- Supports Paging and Sorting.
- Supports result Streaming.
- Supports Async Query.
- Supports customized resultset projection.
- Supports query-based eager fetching.
Cons:
- Less maintainable
@ulend
+++
#### QueryByExample
```java
workPackageRepository.findAll(
Example.of(WorkPackageRecord.builder()
               .name("WP")
               .build(),
           ExampleMatcher.matching()
               .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING)
));
```
+++
@ul
Pros.
- Works well with string fields matching.
- Supports Paging and Sorting.
Cons.
- Does not support multiple complex nested conditions.
- Only works as a supplement for certain scenarios.
@ulend
+++
#### QueryBySpecification
```java
@Repository
public interface WorkPackageRepository extends JpaSpecificationExecutor<WorkPackageRecord> {
}

(Specification<WorkPackageRecord>) (root, query, cb) -> cb.like(root.get("name"), "%"+ text + "%")
```
+++
@ul
Pros.
- Supports any complex condition.
- Supports Paging and Sorting.
- Supports query-based eager fetching.
- Basic testability and maintainability.
Cons.
- Less readable and maintainable.
@ulend
+++
#### QueryDSL
```java
@Repository
public interface WorkPackageRepository extends QuerydslPredicateExecutor<WorkPackageRecord> {
    default Iterable<WorkPackageRecord> findAllNameIncludes(String text) {
        return findAll(QWorkPackageRecord.workPackageRecord.name.contains(text));
    }
}
```
+++
@ul
Pros.
- Supports any complex condition.
- SQL-styled query.
- Supports query-based eager fetching.
- Supports native Paging and Sorting when using QueryDSL Predicates.
- Readability, testability and maintainability.
Cons.
- More effort to config.
- Has relatively high code intrusion.
@ulend
+++
Recommanded way:
@ul
- Derived JPA query + JPQL + QueryDSL
- No native queries.
@ulend
---
### Associations
#### Best way to implement @OneToMany and @ManyToMany
@snap[fragment]
![](./assets/sample-associations.jpg)
@snapend
+++
#### Always start with @Lazy load.
[Eager fetching is a code smell](https://vladmihalcea.com/eager-fetching-is-a-code-smell/)
@ol
- @ManyToOne eager fetching is problematic.
- Eager fetching can not be overridden.
- Eager fetching is less likely to be cached.
@olend
---
#### Query-based eager fetching
@ul
* JPQL/HQL
* QueryBySpecification
* Query DSL
@ulend
---
#### Use @JoinFomula
@JoinFormula annotation allows us to define any SQL select query to provide the relationship between two entities.
---
### Migrations
+++
#### Use flyway to migrate 
@ul
- Use a flexible, unique, valid prefix for migration scripts.
`V2019_0101_1826`
- Use `setOutOfOrder` wisely.
- Use java migrations carefully.
- Split database schema change and value change.
- Use JDBC migration handle complex cases.
@ulend
+++
#### Design explicit API to migrate.
@ul
- Be careful about physical constraints.
- Design Idempotent API. 
@ulend
---
### Time
`Instant` is the simplest solution. 
@Temporal is not required any more after Java 8. 
---
### Misc
- Use @Generator instead of default @GeneratedValue
- Set hibernate DDL to validate.
- Always keep your physical database constraints update to date with your Entity.
+++
#### Use @EntityListener to audit your entity.
* @EnableJpaAuditing
* @CreatedDate and @ModifiedDate
* Customized Auditing rules.
---
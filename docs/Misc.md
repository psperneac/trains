# Misc

## Code snippets

### [Postgres earth distance module](https://www.postgresql.org/docs/9.2/earthdistance.html)

```sql
-- toronto
select ll_to_earth(43.651070, -79.347015);
-- montreal east
select ll_to_earth(45.630001, -73.519997);

-- toronto to montreal east
select earth_distance(ll_to_earth(43.651070, -79.347015), ll_to_earth(45.630001, -73.519997));
-- 511251.4492717375 (metres)

-- toronto to timisoara
select earth_distance(ll_to_earth(43.651070, -79.347015), ll_to_earth(45.75372, 21.22571));
--- 7381294.681172046 (metres)
```

- [Class-validator - validating annotations](https://github.com/typestack/class-validator)
- [Nest Readme.md](Docs/Nest.md)
- [NX Readme.md](Docs/NX.md)


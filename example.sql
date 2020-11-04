-- getPokemon
SELECT * from pokemon
  WHERE id = ?; -- raw style

-- addPokemon
INSERT INTO pokemon(name, price)
  VALUES ($name, $price); -- SQLite named parameter style

-- updatePokemon
UPDATE pokemon SET price=:price;

 --dual
select * from dual;

-- duplicateUpdate
UPDATE pokemon SET price=:price;

-- duplicateUpdate
UPDATE pokemon SET price=:price;

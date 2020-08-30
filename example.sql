-- getPokemon
SELECT * from pokemon
  WHERE id = ?; -- raw style

-- addPokemon
INSERT INTO pokemon(name, price)
  VALUES ($name, $price); -- SQLite named parameter style

-- updatePokemon
UPDATE pokemon SET price=:price;

-- comments
select
    :foo ::INT,
    -- TODO do not hard code this eventually
    :bar ::INT,
    -- TODO I suppose we are ok now

    :bar::INT,

    /*
    now we are really asking for it
    */
    :foo ::INT

 --dual
select * from dual;

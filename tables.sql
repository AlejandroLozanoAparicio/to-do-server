CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  title VARCHAR (255) NOT NULL,
  description VARCHAR (255)
  list_id INT NOT NULL references list (id)
);
CREATE TABLE subtask (
  id SERIAL PRIMARY KEY,
  parent_task_id INT NOT NULL REFERENCES task (id),
  title VARCHAR (255) NOT NULL,
  description VARCHAR (255)
);
CREATE TABLE list (
  id SERIAL PRIMARY KEY,
  name VARCHAR (255) NOT NULL,
  position INT NOT NULL
);

// ALTER TABLE task
// ADD list_id INT NOT NULL references list (id);
const handleRegister = (req, res, db, bcrypt) => {
  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  
  const hash = bcrypt.hashSync(password);
  //   db('users')
  //     .returning(['id', 'email'])
  //     .insert({
  //       name,
  //       email,
  //       joined: new Date()
  //     })
  //     .then(user => {
  //       console.log(user);
  //       console.log(user[0].id);
  //       console.log(user[0].email);
  //       res.json(user[0]);
  //     })
  //     .catch(err => {
  //       res.status(400).json('Unable to register');
  //     });

  db
    .transaction(trx => {
      trx
        .insert({
          name,
          email,
          joined: new Date()
        })
        .into('users')
        .returning(['email', 'id'])
        .then(user => {
          return trx('login')
            .returning(['email', 'userid'])
            .insert({
              hash,
              email: user[0].email,
              userid: user[0].id
            })
            .then(login => {
              res.json({
                id: login[0].userid,
                name,
                email
              });
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.json({ error: 'Unable to register', err }));
};

module.exports = {
  handleRegister
};

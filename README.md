Repository for my mini nodejs project.

A mini Inventory System for company clinic.

Implement the following:
- passport for login and registration Authentication.
- mongoose which provides a straight-forward, schema-based solution.
- async which provides a straiht-forward, powerful functions for working asynchronous control flow using waterfall pattern.


Note:
- update the rights of the user to make it "Admin" in mongo shell
  --db.users.update({_id:1},{$set:{rights:"Admin"}})
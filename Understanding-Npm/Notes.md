Types of errors

- syntax Errors
- Runtime Errors
- Logical Errors

path takes 3 segments
join yields path in return by concatinating 3 segments
1 = global variable -> __dirname
2 = the folder
3 = file
res.sendFile(path.join(__dirname, "views", "shop.html"));

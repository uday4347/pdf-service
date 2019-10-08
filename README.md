# pdf-service
A nodejs api to generate PDF file from HTML

## Sample HTML to PDF request
```
curl --request POST \
  --url http://localhost:3000/pdf \
  --header 'accept: application/pdf' \
  --header 'content-type: text/html' \
  --data '<html>
	<head>
		<title>Test File</title>
	</head>
	<body style="background-color:red">
		<h1>Test</h1>
	</body>
</html>'
```

## Sample request to Open a web page and create PDF
```
curl --request GET \
  --url 'http://localhost:3000/pdf?url=http%3A%2F%2Fgoogle.com' \
  --header 'accept: application/pdf' \
  --data '<html>
	<head>
		<title>Test File</title>
	</head>
	<body style="background-color:red">
		<h1>Test</h1>
	</body>
</html>'
```



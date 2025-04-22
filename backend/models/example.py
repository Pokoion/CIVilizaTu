from mongoengine import Document, StringField, IntField, DateTimeField

class ExampleModel(Document):
    required_field = StringField(required=True)
    optional_field = StringField()
    default_field = IntField(default=42)
    date_field = DateTimeField()

# Creating an object
example = ExampleModel(required_field="Required Value")
example.save()

# Resulting document in MongoDB:
# {
#   "required_field": "Required Value",
#   "optional_field": null,
#   "default_field": 42,
#   "date_field": null
# }

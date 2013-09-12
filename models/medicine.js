var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var InventoryIn = new Schema({
    itemName:   { type: String, required: true },
    quantity:   { type: Number, required: true, default: 0 },
    userID:     { type: String, required: true },
    added:      { type: Date, default: Date.now},
    update:     { type: Date, default: ''}
});
var InventoryOut = new Schema({
    itemName:   { type: String, required: true },
    quantity:   { type: Number, required: true, default: 0 },
    userID:     { type: String, required: true },
    added:      { type: Date, default: Date.now},
    update:     { type: Date, default: ''}
});

var MedicineSchema = new Schema({
    _id:                { type: Number, default: 0 },
    itemName:           { type: String, required: true },
    category:           { type: String, required: true },
    classification:	    { type: String, default: '' },
    dosage_weight:      { type: String, default: '' },
    add_notes:          { type: String, default: '' },
    expired:            { type: String, default: '' },
    added: 		        { type: Date, default: Date.now},
    update:           	{ type: Date, default: ''},
    userID:           	{ type: String, required: true },
    inventoryIn:        [InventoryIn],
    inventoryOut:       [InventoryOut],
    status: 			{ type: Boolean, default: 0}
});


MedicineSchema.pre('save', function (next) {
    console.log(this);
  next();
});

module.exports = mongoose.model('Medicines', MedicineSchema);


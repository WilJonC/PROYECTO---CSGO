const { Router } = require('express')

const { searchByCountry, searchByColumnAndValue, listAll, AddUser, updateCsgoPlayer , deletePlayer} = require('../controllers/users');

const router = Router();

router.get('/:country', searchByCountry);

router.get('/:column/:value', searchByColumnAndValue);

router.get('/', listAll); 

router.put('/', AddUser);

router.patch('/:nick', updateCsgoPlayer);

router.delete('/:nick', deletePlayer);

module.exports = router;

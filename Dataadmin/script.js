const _0x5e2d28=_0x3e8a;(function(_0x161323,_0x58f3b3){const _0x5d13e3=_0x3e8a,_0x3a02d6=_0x161323();while(!![]){try{const _0x4535c9=parseInt(_0x5d13e3(0x110))/0x1*(parseInt(_0x5d13e3(0x10f))/0x2)+parseInt(_0x5d13e3(0x104))/0x3*(-parseInt(_0x5d13e3(0x102))/0x4)+parseInt(_0x5d13e3(0x115))/0x5+-parseInt(_0x5d13e3(0x139))/0x6*(-parseInt(_0x5d13e3(0xff))/0x7)+parseInt(_0x5d13e3(0x11a))/0x8+parseInt(_0x5d13e3(0xfb))/0x9+-parseInt(_0x5d13e3(0xf0))/0xa;if(_0x4535c9===_0x58f3b3)break;else _0x3a02d6['push'](_0x3a02d6['shift']());}catch(_0x35e192){_0x3a02d6['push'](_0x3a02d6['shift']());}}}(_0x1c41,0x21c25));const firebaseConfig={'apiKey':_0x5e2d28(0x134),'authDomain':_0x5e2d28(0x12f),'databaseURL':_0x5e2d28(0x103),'projectId':'razia-data','storageBucket':_0x5e2d28(0x138),'messagingSenderId':_0x5e2d28(0x13a),'appId':_0x5e2d28(0x10e),'measurementId':_0x5e2d28(0xee)};firebase[_0x5e2d28(0xf2)](firebaseConfig);const database=firebase[_0x5e2d28(0xfe)]();document['getElementById'](_0x5e2d28(0x12d))['addEventListener'](_0x5e2d28(0x125),function(_0x2bf461){const _0x4cf5df=_0x5e2d28;_0x2bf461['preventDefault']();const _0x5ef01b=document['getElementById']('username')[_0x4cf5df(0x136)],_0x2c8f26=document['getElementById'](_0x4cf5df(0x122))[_0x4cf5df(0x136)],_0x528837=document['getElementById'](_0x4cf5df(0xf3))[_0x4cf5df(0x136)],_0x2182f2=document['getElementById']('status')[_0x4cf5df(0x136)],_0x1bdceb=database['ref'](_0x4cf5df(0xf5)+_0x5ef01b);_0x1bdceb[_0x4cf5df(0xfa)](_0x4cf5df(0x136))['then'](function(_0x2e03cb){const _0x520ac2=_0x4cf5df;_0x2e03cb[_0x520ac2(0x10d)]()?alert(_0x520ac2(0x126)):_0x1bdceb['set']({'email':_0x2c8f26,'password':_0x528837,'status':_0x2182f2})['then'](()=>{const _0x378a32=_0x520ac2;alert(_0x378a32(0xf9)),document[_0x378a32(0x111)](_0x378a32(0x12d))[_0x378a32(0x11f)](),addUserToTable(_0x5ef01b,_0x2c8f26,_0x2182f2);})[_0x520ac2(0x129)](_0x1f9223=>{const _0x2b7100=_0x520ac2;console['error']('Erreur\x20lors\x20de\x20la\x20création\x20de\x20l\x27utilisateur\x20:',_0x1f9223),alert(_0x2b7100(0x123));});});});function addUserToTable(_0x271cc3,_0x2fb039,_0x5150de){const _0x410c22=_0x5e2d28,_0x22b4a5=document[_0x410c22(0x111)](_0x410c22(0x10a))[_0x410c22(0x109)]('tbody')[0x0],_0x21cded=_0x22b4a5[_0x410c22(0x128)]();_0x21cded[_0x410c22(0x10b)]=_0x410c22(0x12e)+_0x271cc3+'</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<td>'+_0x2fb039+_0x410c22(0xf8)+_0x5150de+_0x410c22(0x116)+_0x271cc3+_0x410c22(0x137)+_0x271cc3+_0x410c22(0xed);}function editUser(_0x551f6d){const _0x136c8f=_0x5e2d28;document['getElementById'](_0x136c8f(0x120))[_0x136c8f(0x107)][_0x136c8f(0x113)]=_0x136c8f(0xf6),document['getElementById'](_0x136c8f(0x114))[_0x136c8f(0x136)]=_0x551f6d,database[_0x136c8f(0xfd)](_0x136c8f(0xf5)+_0x551f6d)['once'](_0x136c8f(0x136))[_0x136c8f(0x11d)](function(_0x2c761f){const _0x316717=_0x136c8f,_0x26b373=_0x2c761f[_0x316717(0xfc)]();document[_0x316717(0x111)](_0x316717(0x108))[_0x316717(0x136)]=_0x26b373[_0x316717(0x122)],document[_0x316717(0x111)](_0x316717(0xf1))[_0x316717(0x136)]=_0x26b373[_0x316717(0xf3)]||'',document[_0x316717(0x111)](_0x316717(0x130))['value']=_0x26b373[_0x316717(0x112)];});}function _0x3e8a(_0x43d9ab,_0xa6faae){const _0x1c4123=_0x1c41();return _0x3e8a=function(_0x3e8ab9,_0x2ced03){_0x3e8ab9=_0x3e8ab9-0xed;let _0x49e8c4=_0x1c4123[_0x3e8ab9];return _0x49e8c4;},_0x3e8a(_0x43d9ab,_0xa6faae);}function deleteUser(_0x1109f9){const _0x2d48d7=_0x5e2d28;confirm(_0x2d48d7(0x135))&&database[_0x2d48d7(0xfd)](_0x2d48d7(0xf5)+_0x1109f9)[_0x2d48d7(0x100)]()[_0x2d48d7(0x11d)](()=>{const _0xb8c7c5=_0x2d48d7;alert(_0xb8c7c5(0x117));const _0xd17867=document[_0xb8c7c5(0x111)](_0xb8c7c5(0x10a)),_0x3eab65=_0xd17867[_0xb8c7c5(0x109)]('tr');for(let _0x4ca394=0x0;_0x4ca394<_0x3eab65[_0xb8c7c5(0x12c)];_0x4ca394++){if(_0x3eab65[_0x4ca394][_0xb8c7c5(0x127)][0x0]['textContent']===_0x1109f9){_0xd17867[_0xb8c7c5(0xf7)](_0x4ca394);break;}}})['catch'](_0x414bc7=>{const _0x5e98f1=_0x2d48d7;console[_0x5e98f1(0x131)]('Erreur\x20lors\x20de\x20la\x20suppression\x20de\x20l\x27utilisateur\x20:',_0x414bc7),alert(_0x5e98f1(0x123));});}function closeModal(){const _0x3a7f56=_0x5e2d28;document[_0x3a7f56(0x111)](_0x3a7f56(0x120))['style'][_0x3a7f56(0x113)]=_0x3a7f56(0xf4);}document[_0x5e2d28(0x111)]('editForm')['addEventListener']('submit',function(_0x2d4eda){const _0x41183b=_0x5e2d28;_0x2d4eda[_0x41183b(0x10c)]();const _0x4fd3c4=document['getElementById']('editUsername')[_0x41183b(0x136)],_0x2e1c0c=document[_0x41183b(0x111)](_0x41183b(0x108))[_0x41183b(0x136)],_0x3cb88a=document[_0x41183b(0x111)](_0x41183b(0xf1))[_0x41183b(0x136)],_0x35c1e3=document['getElementById'](_0x41183b(0x130))['value'];database[_0x41183b(0xfd)](_0x41183b(0xf5)+_0x4fd3c4)[_0x41183b(0xef)]({'email':_0x2e1c0c,'password':_0x3cb88a,'status':_0x35c1e3})[_0x41183b(0x11d)](()=>{const _0x3786de=_0x41183b;alert(_0x3786de(0x133)),closeModal();const _0x39a8e9=document[_0x3786de(0x111)]('userTable'),_0x3b98a4=_0x39a8e9[_0x3786de(0x109)]('tr');for(let _0x5696ee=0x0;_0x5696ee<_0x3b98a4[_0x3786de(0x12c)];_0x5696ee++){if(_0x3b98a4[_0x5696ee][_0x3786de(0x127)][0x0]['textContent']===_0x4fd3c4){_0x3b98a4[_0x5696ee][_0x3786de(0x127)][0x1][_0x3786de(0x124)]=_0x2e1c0c,_0x3b98a4[_0x5696ee][_0x3786de(0x127)][0x2][_0x3786de(0x124)]=_0x35c1e3;break;}}})[_0x41183b(0x129)](_0x3b66a0=>{const _0x34bfe6=_0x41183b;console['error'](_0x34bfe6(0x11c),_0x3b66a0),alert('Une\x20erreur\x20s\x27est\x20produite.\x20Veuillez\x20réessayer.');});}),database['ref'](_0x5e2d28(0x12b))['once']('value')[_0x5e2d28(0x11d)](function(_0x35a5c7){const _0x488fa8=_0x5e2d28;_0x35a5c7[_0x488fa8(0x11e)](function(_0x4a9c0f){const _0x309ee4=_0x488fa8,_0x988c4f=_0x4a9c0f[_0x309ee4(0xfc)]();addUserToTable(_0x4a9c0f['key'],_0x988c4f[_0x309ee4(0x122)],_0x988c4f[_0x309ee4(0x112)]);});});function _0x1c41(){const _0x271449=['submit','Ce\x20nom\x20d\x27utilisateur\x20existe\x20déjà.\x20Veuillez\x20en\x20choisir\x20un\x20autre.','cells','insertRow','catch','child_changed','users','length','userForm','\x0a\x20\x20\x20\x20\x20\x20\x20\x20<td>','razia-data.firebaseapp.com','editStatus','error','Afficher\x20le\x20tableau','Utilisateur\x20mis\x20à\x20jour\x20avec\x20succès\x20!','AIzaSyBMioKaf2knW9BtrdUkrteEcIaKBJvG8JE','Êtes-vous\x20sûr\x20de\x20vouloir\x20supprimer\x20cet\x20utilisateur\x20?','value','\x27)\x22>Modifier</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20onclick=\x22deleteUser(\x27','razia-data.appspot.com','908922VQQUmZ','797498750723','\x27)\x22>Supprimer</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</td>\x0a\x20\x20\x20\x20','G-F4MYMJVSRV','update','2539340zuhsav','editPassword','initializeApp','password','none','users/','block','deleteRow','</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<td>','Utilisateur\x20créé\x20avec\x20succès\x20!','once','97965wsPnYm','val','ref','database','7fRFisw','remove','click','276NBwjRO','https://razia-data-default-rtdb.firebaseio.com','5631drwEvZ','child_removed','smooth','style','editEmail','getElementsByTagName','userTable','innerHTML','preventDefault','exists','1:797498750723:web:385d55e45ab4a0221b1b36','321518EGjNxU','1FrHjlK','getElementById','status','display','editUsername','472385bhDHnT','</td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<td>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20onclick=\x22editUser(\x27','Utilisateur\x20supprimé\x20avec\x20succès\x20!','addEventListener','key','832928hzacdw','tableContainer','Erreur\x20lors\x20de\x20la\x20mise\x20à\x20jour\x20de\x20l\x27utilisateur\x20:','then','forEach','reset','editModal','Masquer\x20le\x20tableau','email','Une\x20erreur\x20s\x27est\x20produite.\x20Veuillez\x20réessayer.','textContent'];_0x1c41=function(){return _0x271449;};return _0x1c41();}const tableContainer=document['getElementById'](_0x5e2d28(0x11b)),showTableButton=document[_0x5e2d28(0x111)]('showTableButton');showTableButton[_0x5e2d28(0x118)](_0x5e2d28(0x101),function(){const _0x4d1297=_0x5e2d28;tableContainer[_0x4d1297(0x107)][_0x4d1297(0x113)]===_0x4d1297(0xf4)?(tableContainer['style'][_0x4d1297(0x113)]='block',showTableButton[_0x4d1297(0x124)]=_0x4d1297(0x121),tableContainer['scrollIntoView']({'behavior':_0x4d1297(0x106)})):(tableContainer['style'][_0x4d1297(0x113)]=_0x4d1297(0xf4),showTableButton[_0x4d1297(0x124)]=_0x4d1297(0x132));}),database[_0x5e2d28(0xfd)](_0x5e2d28(0x12b))['on'](_0x5e2d28(0x12a),function(_0x22c758){const _0x104fac=_0x5e2d28,_0x4c5968=_0x22c758['val'](),_0x41d803=_0x22c758[_0x104fac(0x119)],_0x5ad878=document['getElementById'](_0x104fac(0x10a)),_0x3aa4d4=_0x5ad878['getElementsByTagName']('tr');for(let _0x552b35=0x0;_0x552b35<_0x3aa4d4[_0x104fac(0x12c)];_0x552b35++){if(_0x3aa4d4[_0x552b35][_0x104fac(0x127)][0x0][_0x104fac(0x124)]===_0x41d803){_0x3aa4d4[_0x552b35][_0x104fac(0x127)][0x1][_0x104fac(0x124)]=_0x4c5968[_0x104fac(0x122)],_0x3aa4d4[_0x552b35][_0x104fac(0x127)][0x2]['textContent']=_0x4c5968['status'];break;}}}),database[_0x5e2d28(0xfd)](_0x5e2d28(0x12b))['on'](_0x5e2d28(0x105),function(_0x446824){const _0x56056d=_0x5e2d28,_0x573d59=_0x446824[_0x56056d(0x119)],_0x562797=document['getElementById'](_0x56056d(0x10a)),_0x1eeb97=_0x562797[_0x56056d(0x109)]('tr');for(let _0x2a8ebc=0x0;_0x2a8ebc<_0x1eeb97[_0x56056d(0x12c)];_0x2a8ebc++){if(_0x1eeb97[_0x2a8ebc][_0x56056d(0x127)][0x0][_0x56056d(0x124)]===_0x573d59){_0x562797['deleteRow'](_0x2a8ebc);break;}}});

/* Wireframe page helper — listens to the shell for the notes toggle */
(function(){
  function apply(show){
    document.body.classList.toggle('hide-notes', !show);
  }
  // initial state from localStorage (shared with shell)
  try{
    var s = localStorage.getItem('dm_notes');
    if(s !== null) apply(s === '1');
  }catch(e){}
  window.addEventListener('message', function(ev){
    var d = ev.data || {};
    if(d.type === 'dm_notes') apply(!!d.show);
  });
})();

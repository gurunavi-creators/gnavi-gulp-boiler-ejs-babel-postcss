/**
 * common.js - sample_a.js
 * Author: sekiya
 * ---------------------------------------------------------------------- */
// sample A module
const sampleA = {
  init: () => {
    Utility.console('A')
  },
}

// sample function
function sampleFunction1() {
  const hoge1 = 1
  const huga1 = 2
  return hoge1 + huga1
}

// run
$(() => {
  sampleA.init()
  sampleFunction1()
})


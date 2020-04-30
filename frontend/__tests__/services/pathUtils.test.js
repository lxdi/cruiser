import {getName, getPath, isDir} from "../../source/services/pathUtils"

describe('Tests for pathUtils.isDir method', ()=>{
  test('Simple test', ()=>{
    expect(isDir('/home/name/', '/')).toBe(true)
    expect(isDir('/home/name', '/')).toBe(false)
    expect(isDir('/home/name.zip', '/')).toBe(false)
  })
})

describe('Tests for pathUtils.getName method', ()=>{
  test('Simple test', ()=>{
    expect(getName('/home/name/', '/')).toBe('name')
    expect(getName('/home/name', '/')).toBe('name')
    expect(getName('/home/name.zip', '/')).toBe('name.zip')
  })
})

describe('Tests for pathUtils.getPath method', ()=>{
  test('Simple test', ()=>{
    expect(getPath('/home/name/', '/')).toBe('/home/')
    expect(getPath('/home/name', '/')).toBe('/home/')
    expect(getPath('/home/name.zip', '/')).toBe('/home/')
  })
})
